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
  if (options.take) {
    data.take = options.take;
  }

  const videos = await prisma.video.findMany(data);

  return videos;
};

// Return the video associated with the given id.
export const getVideo = async (id, prisma) => {
  console.log("getVideo");
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
