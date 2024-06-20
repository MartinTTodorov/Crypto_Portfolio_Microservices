const amqp = require('amqplib');
const db = require('../connections/db');

let channel;

const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect('amqp://guest:guest@rabbitmq:5672'); // Replace with your RabbitMQ connection string
    channel = await connection.createChannel();
    await channel.assertQueue('user_deletion', { durable: true });

    console.log('Connected to RabbitMQ. Waiting for messages...');

    // Consume user deletion messages
    channel.consume('user_deletion', async (msg) => {
      if (msg !== null) {
        const { userId } = JSON.parse(msg.content.toString());
        console.log('Received deletion message for user:', userId);

        try {
          const query = 'DELETE FROM portfolios WHERE user_id = $1';
          await db.query(query, [userId]);
          console.log('User portfolios deleted successfully:', userId);
          channel.ack(msg); // Acknowledge message
        } catch (error) {
          console.error('Failed to delete user portfolios:', error);
        }
      }
    }, { noAck: false }); // Ensure noAck is false to manually acknowledge messages

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
