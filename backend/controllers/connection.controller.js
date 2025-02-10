import { sendConnectionAcceptedEmail } from "../emails/emailHandler.js";
import connectionReq from "../models/connectionReq.model.js";
import Notification from "../models/notification.model.js";
import User from "../models/user.model.js";

export const sendConnectionReq = async (req, res) => {
  try {
    const userId = req.params.userId;
    const senderId = req.user._id;

    if (userId.toString() === senderId.toString()) {
      res
        .status(400)
        .json({ message: "tou cant send connection request to yourself" });
    }

    if (req.user.connections.include(userId)) {
      res.status(400).json({ message: "you are alreadly connected" });
    }

    const existingReq = await connectionReq.findOne({
      sender: senderId,
      recipient: userId,
      status: "pending",
    });

    if (existingReq) {
      return res
        .status(400)
        .json({ message: "a connection request already exists" });
    }

    const newReq = new connectionReq({
      sender: senderId,
      recipient: userId,
    });

    await newReq.save();

    res.status(201).json({ message: "a connection request is sent" });
  } catch (error) {
    console.error(`error in sent connection request controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const acceptConnectionReq = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user._id;

    const request = await connectionReq
      .findById(requestId)
      .populate("sender", "name username email")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "connection request not found" });
    }

    if (request.recipient._id.toString() !== userId.toString()) {
      return res
        .status(400)
        .json({ message: "Not authorized for this connection request" });
    }

    if (request.status !== "pending") {
      return res
        .status(500)
        .json({ message: "this request has already been processed" });
    }

    request.status = "accepted";
    await request.save();

    //if i am tour friend then you are are also my friend

    await User.findByIdAndUpdate(request.sender._id, {
      $addToSet: { connections: userId },
    });

    await User.findByIdAndUpdate(userId, {
      $addToSet: { connections: request.sender._id },
    });

    const notification = new Notification({
      recipient: request.sender._id,
      type: connectionAccepted,
      relatedUser: userId,
    });

    await notification.save();

    res.json({ message: "accepted successfully" });

    const senderEmail = request.sender.email;
    const senderName = request.sender.name;

    const recipientName = request.recipient.name;

    const profileurl =
      process.env.PROFILEURL + "/profile/" + request.recipient.name;
    try {
      await sendConnectionAcceptedEmail(
        senderEmail,
        senderName,
        recipientName,
        profileurl
      );
    } catch (error) {
      console.error(`error in sendingEmail ${error}`);
    }
  } catch (error) {
    console.error(`error in accept Connection request controller ${error}`);
    res.status(500).json({ message: "internal server error" });
  }
};

export const rejectConnectionReq = async (req, res) => {
  try {
    const requestId = req.params.requestId;
    const userId = req.user._id;

    const request = await connectionReq
      .findById(requestId)
      .populate("sender", "name username email")
      .populate("recipient", "name username");

    if (!request) {
      return res.status(404).json({ message: "request not found" });
    }

    if (request.recipient._id.toString() != userId.toString()) {
      return res
        .status(401)
        .json({ message: "not authorized to reject connected request" });
    }

    if (request.status !== "pending") {
      return res.status(400).json({ message: "alreadly been processed" });
    }

    request.status = "rejected";
    await request.save();

    res.json({ message: "connection request rejected!" });
  } catch (error) {
    console.error(`error in reject connection request controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const getConnectionReq = async (req, res) => {
  try {
    const userId = req.user._id;

    const requests = await connectionReq
      .find({
        recipient: userId,
        status: "pending",
      })
      .populate(
        "sender",
        "name username profilePicture healineTxt connections"
      );

    res.json(requests);
  } catch (error) {
    console.error(`error in getrequest controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const getUserConnections = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "connections",
      "name username profilePicture headlineTxt connections"
    );
    res.json(user.connections);
  } catch (error) {
    console.error(`error in getUserConnections controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const removeConnection = async (req, res) => {
  try {
    const userId = req.params.userId;
    const myId = req.user._id;

    await User.findByIdAndUpdate(myId, { $pull: { connections: userId } });
    await User.findByIdAndUpdate(userId, { $pull: { connections: myId } });

    res.json({ message: "connection removed successfully" });
  } catch (error) {
    console.error(`error in removeConnection controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const getConnectionStatus = async (req, res) => {
  try {
    const targetUserId = req.params.userId;
    const currUserId = req.user._id;

    const currUser = req.user;
    if (currUser.connections.include(targetUserId)) {
      return res.json({ status: "connected" });
    }

    const pendingReq = await connectionReq.findOne({
      $or: [
        {
          sender: currUserId,
          recipient: targetUserId,
        },
        {
          sender: targetUserId,
          recipient: currUserId,
        },
      ],
      status: "pending",
    });

    if (pendingReq) {
      if (pendingReq.sender.toString() === currUserId.toString()) {
        res.json({ status: "pending" });
      } else {
        res.json({ status: "received", requestId: pendingReq._id });
      }
    }

    // if no connections are found that means we are not not connected or request is sent

    res.json({ status: "not_connected" });
  } catch (error) {
    console.error(`error in getConnectionStatus controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};
