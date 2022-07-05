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
