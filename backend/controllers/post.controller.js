import cloudinary from "../lib/cloudinary.js";
import Post from "../models/post.model.js";
import Notification from "../models/notification.model.js";
import { sendCommentNotificationEmail } from "../emails/emailHandler.js";

export const getFeedPosts = async (req, res) => {
  try {
    const posts = await Post.find({
      author: { $in: req.user.connections },
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
      console.log("post does not exists");
      return res.status(404).json({ message: "psot not found" });
    }

    if (post.author.toString() !== userId.toString()) {
      return res.status(403).json({ message: "unauthorized user" });
    }

    if (post.img) {
      //delete a image from cloudinary
      //it is stored in url format to get postId  we are spliting it
      await cloudinary.uploader.destroy(
        post.img.split("/").pop().split(".")[0]
      );
    }

    await post.findByIdAndDelete(postId);

    res.status(200).json({ message: "post deleted successfulyl" });
  } catch (error) {
    console.error("error in delete post controller", error);
    res.status(500).json({ message: "server error" });
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
    const post = Post.findById(postId);
    const userId = req.user._id;
    if (post.likes.includes(userId)) {
      //unlike the post
      post.likes = post.likes.filter(
        (id) => id.toString() !== userId.toString()
      );
    } else {
      //like the post
      post.likes.push(userId);

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
  } catch (error) {}
};
