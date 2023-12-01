import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import PageContent from '@/components/Layout/PageContent'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, firestore } from '@/firebase/clientApp'
import { useEffect, useState } from 'react'
import {
  query,
  collection,
  orderBy,
  limit,
  getDocs,
  where
} from 'firebase/firestore'
import usePosts from '@/hooks/usePosts'
import { Post, PostVote } from '@/atoms/postAtom'
import PostLoader from '@/components/Posts/PostLoader'
import { Stack } from '@chakra-ui/react'
import PostItem from '@/components/Posts/PostItem'
import { communityState } from '../atoms/communitiesAtom'
import { useRecoilValue } from 'recoil'
import useCommunityData from '@/hooks/useCommunityData'
import CreatePostLink from '@/components/Community/CreatePostLink'
import useDirectory from '@/hooks/useDirectory'
import Recommendations from '@/components/Community/Recommendations'
import Premium from '@/components/Community/Premium'
import PersonalHome from '@/components/Community/PersonalHome'
const inter = Inter({ subsets: ['latin'] })

export default function Home () {
  const [user, loadingUser] = useAuthState(auth)
  const [loading, setLoading] = useState(false)
  const {
    postStateValue,
    setPostStateValue,
    onSelectPost,
    onDeletepost,
    onVote
  } = usePosts()
  const { communityStateValue } = useCommunityData()

  const buildUserHomeFeed = async () => {
    setLoading(true)

    try {
      // get Posts from users' communities
      if (communityStateValue.mySnippets.length) {
        // get post from users' communites
        const myCommunityIds = communityStateValue.mySnippets.map(
          snippet => snippet.communityId
        )

        const postQuery = query(
          collection(firestore, 'posts'),
          where('communityId', 'in', myCommunityIds),
          limit(10)
        )

        const postDocs = await getDocs(postQuery)
        const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        console.log('Here are your posts for home feed!!', posts)
        setPostStateValue(prev => ({
          ...prev,
          posts: posts as Post[]
        }))

        console.log('postStateValue: ', postStateValue)
      } else {
        // if not in any community, get posts from generic feed
        buildNoUserHomeFeed()
      }

      setLoading(false)
    } catch (error) {
      console.log('buildbuildUserHomeFeed error', error)
    }
  }
  const buildNoUserHomeFeed = async () => {
    setLoading(true)
    try {
      const postQuery = query(
        collection(firestore, 'posts'),
        orderBy('voteStatus', 'desc'),
        limit(10)
      )

      const postDocs = await getDocs(postQuery)
      const posts = postDocs.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setPostStateValue(prev => ({
        ...prev,
        posts: posts as Post[]
      }))
    } catch (error) {
      console.log('buildNoUserHomeFeed error', error)
    }
    setLoading(false)
  }

  const getUserPostVotes = async () => {
    try {
      const postIds = postStateValue.posts.map(post => post.id)
      const postVotesQuery = query(
        collection(firestore, 'postVotes'),
        where('postId', 'in', postIds),
        orderBy('voteStatus', 'desc') // order by voteStatus desc
      )

      const postVotesDocs = await getDocs(postVotesQuery)
      const postVotes = postVotesDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      setPostStateValue(prev => ({
        ...prev,
        postVotes: postVotes as PostVote[]
      }))
    } catch (error) {
      console.log('getUserPostVotes error', error)
    }
  }

  // useEffects

  useEffect(() => {
    if (communityStateValue.snippetsFetched) buildUserHomeFeed()
  }, [communityStateValue.snippetsFetched])

  useEffect(() => {
    if (!user && !loadingUser) buildNoUserHomeFeed()
  }, [user, loadingUser])

  useEffect(() => {
    if (user && postStateValue.posts.length) getUserPostVotes()
  }, [user, postStateValue.posts])

  return (
    <PageContent>
      <>
        {loading ? (
          <PostLoader />
        ) : (
          <>
            <CreatePostLink />
            <Stack>
              {postStateValue.posts.map(post => (
                <PostItem
                  key={post.id}
                  post={post}
                  onSelectPost={onSelectPost}
                  onDeletePost={onDeletepost}
                  onVote={onVote}
                  userVoteValue={
                    postStateValue.postVotes.find(
                      item => item.postId === post.id
                    )?.voteValue
                  }
                  userIsCreator={user?.uid === post.creatorId}
                  homePage
                />
              ))}
            </Stack>
          </>
        )}
      </>
      <>
        <Stack spacing={5}>
          <Recommendations />
          <Premium />
          <PersonalHome />
        </Stack>
      </>
    </PageContent>
  )
}
