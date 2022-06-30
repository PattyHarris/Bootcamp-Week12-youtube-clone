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

1. Addition of a Video model.  Note that a Video has a relationship to a user and visa versa.
2. Here we're treating users as 'channels', which means a user can subscribe to another users.  For this, we need 'many-to-many' self relations, e.g. 
```
model User {
  //...

  subscribers  User[] @relation("Subscribers", references: [id])
  subscribedTo User[] @relation("Subscribers", references: [id])
}
```