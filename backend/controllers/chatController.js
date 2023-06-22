const { Message } = require('../models/messageModel');

// Controller action to render the send page
exports.getSendPage = async (req, res) => {
    try {
        const userSession = res.locals.userSession;
        const messages = await Message.find({ "userSession": userSession }).populate('userSession', 'username');

        const send = messages.map((message) => {
            return {
                sender: message.userSession.username,
                content: message.content,
                senderClass: message.userSession.username === 'admin' ? 'admin-message' : 'user-message'
            };
        });

        const names = messages.length > 0 ? messages[0].userSession.username : '';

        res.render('send', { send, names });
    } catch (error) {
        console.error('Error retrieving messages', error);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
};



// Controller action to render the receiver page
exports.getReceiverPage = async (req, res) => {
    try {
        const userSession = res.locals.userSession;
        const message = await Message.findOne({ "userSession": userSession }).populate('userSession', 'username');


        const send = await Message.find({ "userSession": userSession  });

        const names = message ? message.userSession.username : '';
      
        console.log(names);
        res.render('receiver', { send, names });

        console.log(send);

    } catch (error) {
        console.error('Error retrieving messages', error);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
};

// Controller action to get messages for a specific receiver
exports.getMessagesForReceiver = async (req, res) => {
    const { receiver } = req.params;

    try {
        const messages = await Message.find({ receiver });
        res.json(messages);
    } catch (error) {
        console.error('Error retrieving messages', error);
        res.status(500).json({ error: 'Error retrieving messages' });
    }
};

// Controller action to handle sending messages
exports.sendMessage = async (data, io) => {
    const { sender, receiver, content, userSession } = data;

    try {
        // Save the message to the database
        const message = new Message({
            sender,
            receiver,
            content,
            userSession, // Pass the userSession value
        });
        const savedMessage = await message.save();

        // Emit the message to the receiver
        io.to(receiver).emit('receive_message', savedMessage);

        // Find the sender's socket and emit the reply
        const senderSocket = Object.keys(io.sockets.sockets).find(
            (socketId) => io.sockets.sockets[socketId].id === socket.id
        );
        io.to(senderSocket).emit('receive_message', savedMessage);
    } catch (error) {
        console.error('Error saving message', error);
    }
};


// Controller action to handle disconnection
exports.handleDisconnect = () => {
    console.log('User disconnected');
};
