import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandler.js";

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: [...req.user.connections, req.user._id] },
    })
      .populate("author", "name username profilePicture headlineTxt")
      .populate("comments.user", "name profilePicture")
      .sort({ createdAt: -1 });

    res.status(200).json(posts);
  } catch (error) {
    console.error("error in getFeedPosts", error);
    res.status(500).json({ message: "server error" });
  }
};

export const createPost = async (req, res) => {
  try {
    const { content, img } = req.body;

    let newPost;

    if (img) {
      const imgResult = await cloudinary.uploader.upload(img);
      newPost = new Post({
        author: req.user._id,
        content,
        img: imgResult.secure_url,
      });
    } else {
      newPost = new Post({
        author: req.user._id,
        content,
      });
    }

    await newPost.save();

    res.status(201).json(newPost);
  } catch (error) {
    console.error("error in createPost controller", error);
    res.status(500).json({ message: "server error" });
  }
};

export const deletePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);

    if (!post) {
      console.log("Post does not exist");
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Unauthorized user" });
    }

    if (post.img) {
      // Delete the image from Cloudinary
      const publicId = post.img.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(publicId);
    }

    await Post.findByIdAndDelete(postId);

    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error in deletePost controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId)
      .populate("author", "name username profilePicture headlineTxt")
      .populate("comments.user", "name profilePciture username headlineTxt");

    // if (!post) {
    //   return res.status(404).json({ message: "post not found" });
    // }

    res.status(200).json(post);
  } catch (error) {
    console.error("error in getPostByid controller", error);
    res.status(500).json({ message: "server error" });
  }
};

export const createComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const { comment } = req.body;

    const post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          comments: { user: req.user._id, comment },
        },
      },
      { new: true }
    ).populate("author", "name email username headlineTxt profilePicture");

    if (post.author.toString() !== req.user._id.toString()) {
      const newNotification = new Notification({
        recipient: post.author,
        type: "comment",
        relatedUser: req.user._id,
        relatedPost: postId,
      });

      await newNotification.save();
      try {
        const postUrl = process.env.PROFILEURL + "/posts" + postId;
        await sendCommentNotificationEmail(
          post.author.email,
          post.user.name,
          req.user.name,
          postUrl,
          comment
        );
      } catch (error) {}
    }
    res.status(200).json(post);
  } catch (error) {
    console.error(`error in createComment controller ${error}`);
    res.status(500).json({ message: "server error" });
  }
};

export const likePost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const hasLiked = post.likes.includes(userId.toString());

    if (hasLiked) {
      // Unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      // Like the post
      post.likes.push(userId);

      // Only notify if the liker is not the author
      if (post.author.toString() !== userId.toString()) {
        const newNotification = new Notification({
          recipient: post.author,
          type: "like",
          relatedUser: userId,
          relatedPost: postId,
        });
        await newNotification.save();
      }
    }

    await post.save();

    res.status(200).json({
      message: hasLiked ? "Post unliked" : "Post liked",
      likes: post.likes,
      likesCount: post.likes.length,
    });
  } catch (error) {
    console.error("Error in likePost controller:", error);
    res.status(500).json({ message: "Server error" });
  }
};
