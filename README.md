# Youtube Clone

This week's project is to create a Youtube clone.

## Initial Setup

1. Initial setup of Next.js and NextAuth.js is the same as prior weeks. The completed project for reference is here: https://github.com/flaviocopes/bootcamp-2022-week-12-youtube
2. Setup Prisma as before, and add tables for Subreddit.

## Endpoints

1. In this tutorial, we'll be using a different set of endpoints than what is used by Youtube (unlike how we did the Reddit clone):
   1. Homepage: `/`
   2. Subscriptions page: `/subscriptions`
   3. Channel page: `/channel/<USERNAME>`
   4. Single video page: `/video/<ID>`

## Data Model

1. Addition of a Video model. Note that a Video has a relationship to a user and visa versa.
2. Here we're treating users as 'channels', which means a user can subscribe to another users. For this, we need 'many-to-many' self relations, e.g.

```
model User {
  //...

  subscribers  User[] @relation("Subscribers", references: [id])
  subscribedTo User[] @relation("Subscribers", references: [id])
}
```

The above generates an error: Error parsing attribute "@relation": Implicit many-to-many relation should not have references argument defined. Either remove it, or change the relation to one-to-many.

This seems to work, but it's yet to be seen (since I don't understand the error nor the Prisma docs).

```
  subscribers   User[] @relation("Subscribers")
  subscribedTo  User[] @relation("Subscribers")
```

To downgrade to a different version: npm install -D prisma@3 The latest version is 4.0.0 which may have some problems. Flavio indicates the above solution should work.

## Setup Fake Data

1. As before, the fake data generator will reside in '/page/utils.js' and the API handler in '/api/utils.js'. And as before, install the fake generator module:

```
npm install -D @faker-js/faker
```

2. Cleaning the database - by deleting everything in the User table, this also deletes the videos since there is a relationship between the user and videos.
3. Add some videos to S3 - the tutorial suggests you use videos of less than 10MB - you can download them from https://sample-videos.com/, but this seems like a suspicious site to me. I took some of my JustYummy videos and converted them to MP4 (used iMovie). Most are bigger than 10MB, so it's to be seen how much trouble the larger size will be.
4. URLs for the video and thumbnail - upload the files to S3 and then access the Object URL - this will be used when generating content.
5. Install the AWS sdk:

```
npm install aws-sdk
```

6. I changed the buttons to show a light blue hover color - copied from changes in Week 11.
7. In the tutorial, there are instructions for creating a black background - TBD whether I'll add those changes or not.
8. **Note** that in this version of the user creation, an image and username is also include.

## Homepage with Video List

1. As part of creating the home page, we'll create new components 'Videos' and 'Video'.
2. The timeago module needs to be installed:

```
npm install javascript-time-ago
```

Along with that install, add a file to 'lib/timeago.js:

```
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en'

TimeAgo.addLocale(en)

const timeago = new TimeAgo('en-US')

export default timeago
```

3. Add 'lib/data.js' and insert the 'getVideos' API handler.
4. In 'index.js', import 'getVideos' which is then used in the 'getServerSideProps'.
5. The 'Videos' component will handle printing the video information.
6. The 'Video' component will complain about not having 'alt' - added to use the video title. 'Image' is used here instead of 'img' to help with setting the ratio. To use 'Image' we need to give it our domain. Add the AWS S3 domains to the 'next.config.js'.
7. It was a bit tricky to get the thumbnail the right size - 'Image' uses a 800x450 (wxh) image, so the Lucy image had to be resized in Sketch.
8. The 'Video' component also displays additional author information and timestamp data.
9. Add inks to the single video page, which will be '/video/<VIDEO ID>' and to the user’s profile, which is '/channel/<USERNAME>'.
10. Turns out at this point, if I don't use the global.css setting to change the background to black, the header on main page is white.
11. In the 'Videos' component, the tailwind is interesting since it resizes the videos based on the screen size:

```
  return (
    <div className="flex flex-wrap bg-black">
      {videos.map((video, index) => (
        <div className="w-full md:w-1/2 lg:w-1/3" key={index}>
          <Video video={video} />
        </div>
      ))}
    </div>

```

If the screen is large, the videos are 1/3 the size, medium, 1/2 the size, otherwise they are full size.
