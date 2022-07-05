import prisma from "lib/prisma";
import { getUser, getVideos } from "lib/data";
import Videos from "components/Videos";
import Link from "next/link";

export default function Channel({ user, videos }) {
  if (!user) {
    return <p className="text-center p-5">Channel does not exist 😞</p>;
  }

  return (
    <>
      <header className="h-14 flex pt-5 px-5 pb-2">
        <Link href={`/`}>
          <a className="underline">Home</a>
        </Link>

        <div className="grow"></div>
      </header>
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
      videos,
    },
  };
}