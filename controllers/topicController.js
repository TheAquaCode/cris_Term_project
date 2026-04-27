const Topic = require('../models/Topic');
const Message = require('../models/Message');
const User = require('../models/User');
const TopicService = require('../observers/topicService');
const topicAccessObserver = require('../observers/topicAccessObserver');

// Wire observer once
const service = TopicService.getInstance();
service.subscribe(topicAccessObserver);

// MVC Controller for topics and dashboard
class TopicController {

  // GET /dashboard  — 2 most recent messages per subscribed topic
  static async getDashboard(req, res) {
    try {
      const user = await User.findById(req.session.userId)
        .populate('subscribedTopics');

      const topicsWithMessages = await Promise.all(
        user.subscribedTopics.map(async (topic) => {
          const messages = await Message.find({ topic: topic._id })
            .sort({ postedAt: -1 })
            .limit(2)
            .populate('author', 'username');
          return { topic, messages };
        })
      );

      res.render('dashboard', {
        title: 'Dashboard',
        username: req.session.username,
        topicsWithMessages,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (err) {
      console.error(err);
      res.redirect('/login');
    }
  }

  // GET /topics — all topics the user is NOT subscribed to (for subscription)
  static async getTopics(req, res) {
    try {
      const user = await User.findById(req.session.userId);
      const subscribedIds = user.subscribedTopics.map(id => id.toString());
      const allTopics = await Topic.find().populate('createdBy', 'username').sort({ createdAt: -1 });

      const available = allTopics.filter(t => !subscribedIds.includes(t._id.toString()));
      const subscribed = allTopics.filter(t => subscribedIds.includes(t._id.toString()));

      res.render('topics/index', {
        title: 'Topics',
        username: req.session.username,
        available,
        subscribed,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to load topics.');
      res.redirect('/dashboard');
    }
  }

  // POST /topics/subscribe/:id
  static async subscribe(req, res) {
    try {
      await User.findByIdAndUpdate(req.session.userId, {
        $addToSet: { subscribedTopics: req.params.id }
      });
      req.flash('success', 'Subscribed!');
      res.redirect('/topics');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Could not subscribe.');
      res.redirect('/topics');
    }
  }

  // POST /topics/unsubscribe/:id
  static async unsubscribe(req, res) {
    try {
      await User.findByIdAndUpdate(req.session.userId, {
        $pull: { subscribedTopics: req.params.id }
      });
      req.flash('success', 'Unsubscribed.');
      const ref = req.get('Referer') || '/dashboard';
      res.redirect(ref);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Could not unsubscribe.');
      res.redirect('/dashboard');
    }
  }

  // GET /topics/new
  static getNewTopic(req, res) {
    res.render('topics/new', {
      title: 'New Topic',
      username: req.session.username,
      error: req.flash('error')
    });
  }

  // POST /topics/new
  static async postNewTopic(req, res) {
    const { title, description } = req.body;
    try {
      if (!title) {
        req.flash('error', 'Topic title is required.');
        return res.redirect('/topics/new');
      }
      const topic = new Topic({ title, description, createdBy: req.session.userId });
      await topic.save();
      // Auto-subscribe creator
      await User.findByIdAndUpdate(req.session.userId, {
        $addToSet: { subscribedTopics: topic._id }
      });
      req.flash('success', `Topic "${title}" created and subscribed!`);
      res.redirect('/dashboard');
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to create topic.');
      res.redirect('/topics/new');
    }
  }

  // GET /topics/:id — view thread
  static async getTopicThread(req, res) {
    try {
      const topic = await Topic.findById(req.params.id).populate('createdBy', 'username');
      if (!topic) return res.status(404).render('404', { title: '404' });

      // Notify observers → increment accessCount
      service.topicAccessed(topic._id);

      const messages = await Message.find({ topic: topic._id })
        .sort({ postedAt: 1 })
        .populate('author', 'username');

      const user = await User.findById(req.session.userId);
      const isSubscribed = user.subscribedTopics.map(id => id.toString()).includes(topic._id.toString());

      res.render('topics/thread', {
        title: topic.title,
        username: req.session.username,
        topic,
        messages,
        isSubscribed,
        error: req.flash('error'),
        success: req.flash('success')
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Could not load topic.');
      res.redirect('/dashboard');
    }
  }

  // POST /topics/:id/message
  static async postMessage(req, res) {
    const { content } = req.body;
    try {
      if (!content || !content.trim()) {
        req.flash('error', 'Message cannot be empty.');
        return res.redirect(`/topics/${req.params.id}`);
      }

      // Verify subscription
      const user = await User.findById(req.session.userId);
      if (!user.subscribedTopics.map(id => id.toString()).includes(req.params.id)) {
        req.flash('error', 'You must be subscribed to post.');
        return res.redirect(`/topics/${req.params.id}`);
      }

      const msg = new Message({ topic: req.params.id, author: req.session.userId, content });
      await msg.save();

      service.messagePosted(req.params.id, req.session.userId);

      req.flash('success', 'Message posted!');
      res.redirect(`/topics/${req.params.id}`);
    } catch (err) {
      console.error(err);
      req.flash('error', 'Failed to post message.');
      res.redirect(`/topics/${req.params.id}`);
    }
  }

  // GET /stats
  static async getStats(req, res) {
    try {
      const topics = await Topic.find()
        .sort({ accessCount: -1 })
        .populate('createdBy', 'username');

      const myMessageCount = await Message.countDocuments({ author: req.session.userId });

      res.render('stats', {
        title: 'Topic Statistics',
        username: req.session.username,
        topics,
        myMessageCount
      });
    } catch (err) {
      console.error(err);
      req.flash('error', 'Could not load stats.');
      res.redirect('/dashboard');
    }
  }
}

module.exports = TopicController;
