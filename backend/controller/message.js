import Message from '../model/Message.js';

export const getAllMessages = async (req, res) => {
    try {
        const messages = await Message.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

export const createMessage = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newMessage = new Message({
            name,
            email,
            message
        });

        await newMessage.save();
        res.status(201).json(newMessage);
    } catch (err) {
        res.status(500).json({ message: 'Error saving message' });
    }
};

export const markAsRead = async (req, res) => {
    const { id } = req.params;
    try {
        const message = await Message.findByIdAndUpdate(id, { status: 'read' }, { new: true });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json(message);
    } catch (err) {
        res.status(500).json({ message: 'Error updating message status' });
    }
};

export const deleteMessage = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await Message.findByIdAndDelete(id);
        if (!result) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.json({ message: 'Message deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting message' });
    }
};
