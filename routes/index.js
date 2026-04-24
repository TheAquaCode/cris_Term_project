const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/authController');
const TopicController = require('../controllers/topicController');
const { requireAuth, redirectIfAuth } = require('../middleware/auth');

// Root
router.get('/', (req, res) => res.redirect('/dashboard'));

// Auth
router.get('/register', redirectIfAuth, AuthController.getRegister);
router.post('/register', redirectIfAuth, AuthController.postRegister);
router.get('/login', redirectIfAuth, AuthController.getLogin);
router.post('/login', redirectIfAuth, AuthController.postLogin);
router.post('/logout', requireAuth, AuthController.logout);

// Dashboard
router.get('/dashboard', requireAuth, TopicController.getDashboard);

// Stats
router.get('/stats', requireAuth, TopicController.getStats);

// Topics
router.get('/topics', requireAuth, TopicController.getTopics);
router.get('/topics/new', requireAuth, TopicController.getNewTopic);
router.post('/topics/new', requireAuth, TopicController.postNewTopic);
router.get('/topics/:id', requireAuth, TopicController.getTopicThread);
router.post('/topics/subscribe/:id', requireAuth, TopicController.subscribe);
router.post('/topics/unsubscribe/:id', requireAuth, TopicController.unsubscribe);
router.post('/topics/:id/message', requireAuth, TopicController.postMessage);

module.exports = router;
