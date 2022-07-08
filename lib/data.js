import { amount } from "lib/config";

// Return all the videos from the database.
export const getVideos = async (options, prisma) => {
  const data = {
    where: {},
    orderBy: [
      {
        createdAt: "desc",
      },
    ],
    include: {
      author: true,
    },
  };

  // For the single video page, limit the number of videos returned.
  data.take = options.take || amount;
  if (options.skip) {
    data.skip = options.skip;
  }

  if (options.author) {
    data.where = {
      author: {
        id: options.author,
      },
    };
  }

  // Filter videos by user and the videos that user is subscribed to.
  if (options.subscriptions) {
    const user = await prisma.user.findUnique({
      where: {
        id: options.subscriptions,
      },
      include: {
        subscribedTo: true,
      },
    });

    data.where = {
      authorId: {
        in: user.subscribedTo.map((channel) => channel.id),
      },
    };
  }
  const videos = await prisma.video.findMany(data);

  return videos;
};

// Return the video associated with the given id.
export const getVideo = async (id, prisma) => {
  const video = await prisma.video.findUnique({
    where: {
      id,
    },
    include: {
      author: true,
    },
  });

  return video;
};

// Returns the user data for the given username.
export const getUser = async (username, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  });

  return user;
};

// Return the number of subscribers for a given user.
export const getSubscribersCount = async (username, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      subscribers: true,
    },
  });

  return user.subscribers.length;
};

// Returns true if the logged in user is subscribed to a given user.
export const isSubscribed = async (username, isSubscribedTo, prisma) => {
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
    include: {
      subscribedTo: {
        where: {
          id: isSubscribedTo,
        },
      },
    },
  });

  return user.subscribedTo.length === 0 ? false : true;
};
