import prisma from "lib/prisma";
import Link from "next/link";
import Head from "next/head";

import { useState } from "react";

import { getUser, getVideos } from "lib/data";
import { amount } from "lib/config";

import Videos from "components/Videos";
import LoadMore from "components/LoadMore";
import Heading from "components/Heading";

export default function Channel({ user, initialVideos }) {
  const [videos, setVideos] = useState(initialVideos);
  const [reachedEnd, setReachedEnd] = useState(initialVideos.length < amount);

  if (!user) {
    return <p className="text-center p-5">Channel does not exist 😞</p>;
  }

  return (
    <>
      <Head>
        <title>Channel of {user.name}</title>
        <meta name="description" content={`Channel of ${user.name}`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Heading />
      <div>
        <div className="flex justify-between">
          <div className="flex m-5">
            {user.image && (
              <img
                className="w-20 h-20 mt-2 mr-2 rounded-full"
                src={user.image}
                alt={user.name}
              />
            )}
            <div className="mt-5">
              <p className="text-lg font-bold text-white">{user.name}</p>
            </div>
          </div>
        </div>
        <div>
          <Videos videos={videos} />

          {!reachedEnd && (
            <LoadMore
              videos={videos}
              setVideos={setVideos}
              setReachedEnd={setReachedEnd}
              author={user}
            />
          )}
        </div>
      </div>
    </>
  );
}

export async function getServerSideProps(context) {
  // The username is in context.params.username.
  let user = await getUser(context.params.username, prisma);
  user = JSON.parse(JSON.stringify(user));

  let videos = await getVideos({ author: user.id }, prisma);
  videos = JSON.parse(JSON.stringify(videos));

  return {
    props: {
      user,
      initialVideos: videos,
    },
  };
}
