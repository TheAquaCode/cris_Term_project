const { Observer } = require('./base');
const Topic = require('../models/Topic');

// Concrete Observer: updates topic access stats whenever a topic is viewed
class TopicAccessObserver extends Observer {
  async update(event, data) {
    if (event === 'topic:accessed') {
      try {
        await Topic.findByIdAndUpdate(data.topicId, {
          $inc: { accessCount: 1 }
        });
      } catch (err) {
        console.error('TopicAccessObserver error:', err);
      }
    }
  }
}

module.exports = new TopicAccessObserver();
