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

## Single Video Page

1. Create the video page at 'pages/video/[id].js'.
2. Add a 'getVideo' function to 'data.js'.
3. We need a video player, so install:

```
npm install react-player
```

More information about this player: https://github.com/cookpete/react-player#readme

4. Update the video page '[id].js' with the video player setup and JSX.
5. Additional JSX added to '[id].js' to provide a link back to the 'home' page as well as data about the video (e.g. author name, etc.).
6. Missed a 'Link' around the video image - added. Found an issue as well - if you put a 'Link' around a 'Image', you also need a surrounding 'a' tag.
7. Show a list of latest videos on the right of the video shown in 'SingleVideo'. The list is limited to 3 videos. If the screen size is small, this side list of videos is hidden.
8. To limit the number of videos to 3, we use the 'options' parameter.
9. There is an issue with the react player (Flavio discusses in the video) that is fixed by dynamically loading the player - which explains this code:

```
import dynamic from "next/dynamic";
const ReactPlayer = dynamic(() => import("react-player/lazy"), { ssr: false });
```

## User Profile Page (Channels)

1. Each user has a channel on the URL `channel/<USERNAME>`. Create a file `pages/channel/[username].js`
2. Add 'getUser' to 'data.js'.
3. Update 'getVideos' to use the 'options' parameter for 'author' - if set, return only the videos for a given author.
4. Add the calls to 'getUser' and 'getVideos' to 'getServerSideProps', changing the input parameters to 'Channel' as well.
5. Use the 'Videos' component inside of 'Channel' to print the video information for this user.
6. Note: a good practice is to use simple code samples to start components, etc. Here is an example of a component - doesn't do anything, but has the starter framework.

```
export default function Channel({  }) {
  return (
    <>
    </>
  )
}

export async function getServerSideProps(context) {
	//we have the username in context.params.username
  return {
    props: {
    },
  }
}
```

## Common Header Component

1. Add the new component 'Heading.js'.
2. Refactor 'pages/index.js', 'pages/video/[id].js' and 'pages/channel/[username].js' to use the new header component. Note that each page must also include the following import if it's not already there:

```
import Head from 'next/head'
```

## Implement Pagination

1. Store the number of videos per page in a new config file 'lib/config.js'. The current number of videos per page is currently set to 3.
2. Refactor 'getVideos' to use the new 'amount' value - seems like 'amount' should be 'videosPerPage' or something more clear...
3. We'll also be making use of offset-based pagination - see code for data.skip: "Offset pagination uses 'skip' and 'take' to skip a certain number of results and select a limited range"
4. To load more videos, add a new component 'LoadMore.js' and include the component in 'index.js'.
5. Add a new endpoint handler 'pages/api/videos.js'.
6. Add an 'onClick' handler to 'LoadMore' and pass in 'videos' to the component (in 'index.js'). The url in the 'onClick' can then use the following url:

```
const url = `/api/videos?skip=${videos.length}`
```

The reason we don't use just the 'length' for the prop into LoadMore is that later in the lesson, the fetch for more videos will add to the initial set of videos.  
7. To check for the 'end', we check that the returned number of videos is less than our 'amount'. The code to check for the end not explained well, but if you look at how the following hooks are used, it makes sense -

```
const [videos, setVideos] = useState(initialVideos)
const [reachedEnd, setReachedEnd] = useState(false)

```

8. The logic here works pretty well except when there is exactly the number of videos = amount. For example, if the user has exactly 3 videos and amount = 3, the 'Load More' button still shows. I would think in this case, it would not show. But if you check for '<= amount' (in LoadMore), that doesn't work since the amount returned is always going to be '<= amount'. What needs to happen is that there is some sort of 'look ahead'...
