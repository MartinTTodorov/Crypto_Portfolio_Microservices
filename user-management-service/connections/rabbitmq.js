const amqp = require('amqplib');
const User = require('../models/userModel');

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    const channel = await connection.createChannel();
    await channel.assertQueue('user_registration', { durable: true });
    await channel.assertQueue('user_deletion', { durable: true });

    console.log('Connected to RabbitMQ. Waiting for messages...');

    channel.consume('user_registration', async (msg) => {
      if (msg !== null) {
        const userData = JSON.parse(msg.content.toString());
        console.log('Received message:', userData);

        try {
          await User.createUser(userData.id, userData.name, userData.phone, userData.address);
          console.log('User created successfully:', userData.id);
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to create user:', error);
          channel.nack(msg); // Not acknowledge the message to requeue it
        }
      }
    }, { noAck: false });
  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
};

const publishToQueue = async (queue, message) => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672');
    const channel = await connection.createChannel();
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)), { persistent: true });
  } catch (err) {
    console.error('Failed to publish message', err);
  }
};

module.exports = {
  connectRabbitMQ,
  publishToQueue,
};
