import { authModalState } from '@/atoms/authModalAtom'
import { communityState } from '@/atoms/communitiesAtom'
import { Post, PostVote, postState } from '@/atoms/postAtom'
import { auth, firestore, storage } from '@/firebase/clientApp'
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from 'firebase/firestore'
import { deleteObject, ref } from 'firebase/storage'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil'

const usePosts = () => {
  const [user] = useAuthState(auth)
  const [postStateValue, setPostStateValue] = useRecoilState(postState)
  const currentCommunity = useRecoilValue(communityState).currentCommunity
  const setAuthModal = useSetRecoilState(authModalState)
  const router = useRouter()

  const onVote = async (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation()

    if (!user?.uid) {
      setAuthModal({ open: true, view: 'login' })
      return
    }

    try {
      const { voteStatus } = post

      const existingVote = postStateValue.postVotes.find(
        vote => vote.postId === post.id
      )

      const batch = writeBatch(firestore)
      const updatedPost = { ...post }
      let updatedPosts = [...postStateValue.posts]
      let updatedPostVotes = [...postStateValue.postVotes]

      // console.log('updatedPost', updatedPost)
      // console.log('updatedPosts', updatedPosts)
      // console.log('updatedPostVotes', updatedPostVotes)

      let voteChange = vote

      // new vote
      if (!existingVote) {
        // add/subbtract 1 to/from post.voteStatus
        const postVoteRef = doc(
          collection(firestore, 'users', `${user?.uid}/postVotes`)
        )

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id,
          communityId,
          voteValue: vote // 1 or -1
        }

        batch.set(postVoteRef, newVote)

        updatedPost.voteStatus = voteStatus + vote
        updatedPostVotes = [...updatedPostVotes, newVote]
      } else {
        // vote already exists

        const postVoteRef = doc(
          firestore,
          'users',
          `${user?.uid}/postVotes/${existingVote.id}`
        )

        // Removing the vote
        if (existingVote.voteValue === vote) {
          // add or subtract 1 from post.voteStatus
          updatedPost.voteStatus = voteStatus - vote
          updatedPostVotes = updatedPostVotes.filter(
            vote => vote.id !== existingVote.id
          )

          batch.delete(postVoteRef)

          voteChange *= -1
        } else {
          // flipping vote, up -> down / down -> up

          updatedPost.voteStatus = voteStatus + 2 * vote

          const voteIdx = postStateValue.postVotes.findIndex(
            vote => vote.id === existingVote.id
          )

          updatedPostVotes[voteIdx] = {
            ...existingVote,
            voteValue: vote
          }

          // updating the existing postValue document
          batch.update(postVoteRef, {
            voteValue: vote
          })

          voteChange = 2 * vote
        }
      }

      // update the states with updated Values
      const postIdx = postStateValue.posts.findIndex(
        item => item.id === post.id
      )
      updatedPosts[postIdx] = updatedPost

      setPostStateValue(prev => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes
      }))

      if (postStateValue.selectedPost) {
        setPostStateValue(prev => ({
          ...prev,
          selectedPost: updatedPost
        }))
      }

      const postRef = doc(firestore, 'posts', post.id)
      batch.update(postRef, { voteStatus: voteStatus + voteChange })
      await batch.commit()
    } catch (error) {
      console.log('onVote error', error)
    }
  }

  const onSelectPost = (post: Post) => {
    setPostStateValue(prev => ({
      ...prev,
      selectedPost: post
    }))

    router.push(`/r/${post.communityId}/comments/${post.id}`)
  }

  const onDeletepost = async (post: Post): Promise<boolean> => {
    try {
      // Check if there is an iamge, delete if exists
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`)
        await deleteObject(imageRef)
      }
      // delete the post from firestore

      const postDocRef = doc(firestore, 'posts', post.id)
      await deleteDoc(postDocRef)

      // update recoil state
      setPostStateValue(prev => ({
        ...prev,
        posts: prev.posts.filter(item => item.id !== post.id)
      }))
    } catch (error) {}
    return true
  }

  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, 'users', `${user?.uid}/postVotes`),
      where('communityId', '==', communityId)
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
  }

  useEffect(() => {
    if (!user || !currentCommunity?.id) return
    getCommunityPostVotes(currentCommunity.id)
  }, [user, currentCommunity])

  useEffect(() => {
    //clear user post votes
    if (!user) {
      setPostStateValue(prev => ({
        ...prev,
        postVotes: []
      }))
    }
  }, [user])
  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletepost
  }
}

export default usePosts
