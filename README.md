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

## Implement Login, User Profile

1. In this login scenario, the user can upload an avatar for their profile.
2. Add a 'login' or 'logout' button and click handler to 'Heading.js'.
3. In 'index.js' direct the user to the 'setup' page if they have not set up their profile.
4. Add 'pages/setup.js' which is pretty much the same as we've done before. The API handler will be 'api/setup.js' - first we need to install the middleware as we did in the Reddit Clone:

```
npm install multiparty next-connect@0.12.2
```

Note: the version here is critical. 'next-connect' has a new version which will cause a lot of breakage in the project.

5. Create the file 'middleware/middleware.js' that will have the middleware setup code. Its job is to make the files information available in the API route. 6. To handle various upload tasks, add a new file 'lib/upload.js'. 7. Add the 'api/setup.js' to handle the processing of the setup data request. Note that since we're using the middleware, we need to use '[0]' for all body fields. 8. Ran into a problem where we when the index page redirects to setup, I encountered the following error:

```
next-dev.js?3515:24 Error: Abort fetching component for route: "/setup"
    at handleCancelled (router.js?8684:1520:27)
    at _callee$ (router.js?8684:1088:13)
    at tryCatch (runtime.js?ecd4:45:16)
    at Generator.invoke [as _invoke] (runtime.js?ecd4:274:1)
    at prototype.<computed> [as next] (runtime.js?ecd4:97:1)
    at asyncGeneratorStep (_async_to_generator.js?0e30:23:1)
    at _next (_async_to_generator.js?0e30:12:1)
```

Turns out that 'next' has been updated to 12.2.0 - Flavio's version is 12.1.6 - the redirection works fine in 12.1.6. I have installed the old version to move along.

Turns out we need to return 'null' - so the following code works:

```
if (session && !session.user.name) {
    router.push("/setup");
    return null;
  }

```

## Add User Information to Header

1. Here the user information is added to the header. Clicking on the image will then show the user's channel page.
2. In the 'Heading' component, add the user data with a link using the user's username.
3. Ran into another bug where '[...nextauth].js' was missing the user's image, username, and name fields in the 'callbacks' section. The code is correct if you use the 'start' code, but not shown in the text tutorial.

## Subscriptions

1. In this section:
   1. Show the subscribers count in the channels pages.
   2. Add a button on the channels to subscribe. Once subscribed, this will turn into an unsubscribe button.
   3. Add a “subscriptions” page that lists the videos of the people you’re subscribed to.
2. Starting with the subscribers count, add 'getSubscribersCount' to 'data.js'.
3. Add the subscriber count to 'channel/[username].js'.
4. All people to subscribe: add a 'SubscribedButton' component and add to 'pages/channel/[username].js'. The ''post' request from this button is handled by '/api/subscribe' - see this code for how subscriptions are setup using a special syntax that uses 'connect' to connect 2 users together via the subscribedTo relation, as it’s a many-to-many self relation in the database.
5. Add 'api/unsubscribe' that uses 'disconnect' to un-connect 2 users.
6. In order for the 'Subscribe' button to change state, we need to add 'isSubscribed' to 'data.js'. Add a call to this new function in '[username].js' in the 'getServerSideProps'.
7. Pass 'subscribers' to the 'SubscribeButton'.
8. When you hover over the 'SubscribeButton' when it's green (e.g. you've subscribed), it will change text and color to show what happens if it's clicked. See 'useState'. The code DOES NOT do the reverse, that is, if it's showing 'Unsubscribe', hovering does not show 'Subscribe' and green.
9. Add the subscription page which shows which people you're subscribe to? Create the 'subscriptions' page. We copy the code from 'index.js' with a couple of changes for subscriptions - this and the call to 'LoadMore'.

```
let videos = await getVideos({ subscriptions: session.user.id }, prisma)
```

10. The 'Heading' component is refactored to show the subscriptions link. There's a bug in the tutorial which shows the 'Heading' component taking 'subscriptions' as a prop - doesn't need it.
11. Update 'getVideos' to look at the 'subscriptions' options - this will filter the list of videos to return only those the user is subscribe to.
12. In the 'subscriptions' page, pass 'subscriptions' as a prop to 'LoadMore' to provide the same filter.
13. Refactor 'LoadMore' to handle the 'subscriptions' prop.
14. In 'pages/api/videos.js' handle the 'subscriptions' option.
