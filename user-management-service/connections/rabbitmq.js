// user-management-service/rabbitmq.js
const amqp = require('amqplib');
const User = require('../models/userModel');

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672'); // Replace with your RabbitMQ connection string
    const channel = await connection.createChannel();
    await channel.assertQueue('user_registration', { durable: true });

    console.log('Connected to RabbitMQ. Waiting for messages...');

    channel.consume('user_registration', async (msg) => {
      if (msg !== null) {
        const userData = JSON.parse(msg.content.toString());
        
        console.log('Received message:', userData);

        try {
          await User.createUser(userData.id, userData.name, userData.phone, userData.address);
          console.log('User created successfully:', userData.id);
          channel.ack(msg); // Acknowledge message
        } catch (error) {
          console.error('Failed to create user:', error);
        }
      }
    }, { noAck: false }); // Ensure noAck is false to manually acknowledge messages

  } catch (err) {
    console.error('Failed to connect to RabbitMQ', err);
  }
};

module.exports = {
  connectRabbitMQ,
};
