import prisma from "lib/prisma";
import { faker } from "@faker-js/faker";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_SECRET_ACCESS_KEY,
});

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.end();
  }

  // Generate content by creating random users, videos, etc.
  if (req.body.task === "generate_content") {
    let count = 0;
    const numUsers = 10;

    let fakeNames = [];
    while (count < numUsers) {
      fakeNames[count] = faker.internet.userName().toLowerCase();
      count++;
    }

    count = 0;

    while (count < numUsers) {
      await prisma.user.create({
        data: {
          name: fakeNames[count],
          email: faker.internet.email().toLowerCase(),
        },
      });
      count++;
    }

    const videoUrl =
      "https://bootcamp-pharry.s3.us-west-1.amazonaws.com/Day1Turn2.mp4";

    const thumbnailUrl =
      "https://bootcamp-pharry.s3.us-west-1.amazonaws.com/movieThumbNail1.jpg";

    // Random user setup.
    const users = await prisma.user.findMany();

    if (users.length === 0) {
      return res.status(409).json({
        message: `No users found in the database yet.  No jobs created.`,
      });
    }

    const getRandomUser = () => {
      const randomIndex = Math.floor(Math.random() * users.length);
      return users[randomIndex];
    };

    // Create 20 videos, randomly assigned to users
    let videosCount = 0;

    while (videosCount < 20) {
      await prisma.video.create({
        data: {
          title: faker.lorem.words(),
          thumbnail: thumbnailUrl,
          url: videoUrl,
          length: faker.datatype.number(1000),
          visibility: "public",
          views: faker.datatype.number(1000),
          author: {
            connect: { id: getRandomUser().id },
          },
        },
      });

      videosCount++;
    }
  }

  //==========
  // Clean the database by wiping out the user table.
  if (req.body.task === "clean_database") {
    await prisma.user.deleteMany({});
  }

  res.end();
}
