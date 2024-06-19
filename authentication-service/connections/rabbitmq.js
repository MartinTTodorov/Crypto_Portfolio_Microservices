// authentication-service/rabbitmq.js
const amqp = require('amqplib');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672'); // Replace with your RabbitMQ connection string
    channel = await connection.createChannel();
    await channel.assertQueue('user_registration', { durable: true });
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
};

const publishToQueue = async (queue, message) => {
  try {
    if (!channel) {
      await connectRabbitMQ();
    }
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (err) {
    console.error('Failed to publish message', err);
  }
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
};
