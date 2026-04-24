const { Subject } = require('./base');

// Topic Service Subject - notifies observers about topic events
class TopicService extends Subject {
  constructor() {
    super();
    if (TopicService.instance) return TopicService.instance;
    TopicService.instance = this;
  }

  topicAccessed(topicId) {
    this.notify('topic:accessed', { topicId });
  }

  messagePosted(topicId, userId) {
    this.notify('message:posted', { topicId, userId });
  }

  static getInstance() {
    if (!TopicService.instance) new TopicService();
    return TopicService.instance;
  }
}

module.exports = TopicService;
