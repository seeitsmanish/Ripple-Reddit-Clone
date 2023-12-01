import React, { useEffect, useState } from 'react'
import { useRecoilState, useSetRecoilState } from 'recoil'
import {
  Community,
  CommunitySnippet,
  communityState
} from '../atoms/communitiesAtom'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth, firestore } from '@/firebase/clientApp'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  increment,
  writeBatch
} from 'firebase/firestore'
import { authModalState } from '@/atoms/authModalAtom'
import { useRouter } from 'next/router'
const useCommunityData = () => {
  const [user] = useAuthState(auth)
  const router = useRouter()
  const [communityStateValue, setCommunityStateValue] =
    useRecoilState(communityState)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const setAuthModalState = useSetRecoilState(authModalState)

  const joinCommunity = async (communityData: Community) => {
    try {
      // batch write
      //creating a new commmunity snippet
      // udating the numberOfMembers(1)
      const batch = writeBatch(firestore)
      const newSnippet: CommunitySnippet = {
        communityId: communityData.id,
        imageURL: communityData.imageURL || '',
        isModerator: user?.uid === communityData.creatorId
      }

      batch.set(
        doc(
          firestore,
          `users/${user?.uid}/communitySnippets`,
          communityData.id
        ),
        newSnippet
      )

      batch.update(doc(firestore, 'communities', communityData.id), {
        numberOfMembers: increment(1)
      })

      await batch.commit()

      // update the recoild state - communityState

      setCommunityStateValue(prev => ({
        ...prev,
        mySnippets: [...prev.mySnippets, newSnippet]
      }))
    } catch (error: any) {
      console.log('joinCommunity error', error)
      setError(error.message)
    }

    setLoading(false)
  }
  const leaveCommunity = async (communityId: string) => {
    // batch write
    //deleting a new commmunity snippet
    // udating the numberOfMembers(-1)

    try {
      const batch = writeBatch(firestore)
      batch.delete(
        doc(firestore, `users/${user?.uid}/communitySnippets`, communityId)
      )
      batch.update(doc(firestore, 'communities', communityId), {
        numberOfMembers: increment(-1)
      })
      await batch.commit()
      // update the recoile state
      setCommunityStateValue(prev => ({
        ...prev,
        mySnippets: prev.mySnippets.filter(
          item => item.communityId !== communityId
        )
      }))
    } catch (error: any) {
      console.log('leaveCommunity error', error)
      setError(error.message)
    }

    setLoading(false)
  }

  const getMySnippets = async () => {
    try {
      const snippetDoc = await getDocs(
        collection(firestore, `users/${user?.uid}/communitySnippets`)
      )

      const snippets = snippetDoc.docs.map(doc => ({ ...doc.data() }))
      console.log(snippets)

      setCommunityStateValue(prev => ({
        ...prev,
        mySnippets: snippets as CommunitySnippet[],
        snippetsFetched: true
      }))
    } catch (error: any) {
      console.log('getMySnippets error', error)
      setError(error.message)
    }
  }

  const onJoinOrLeaveCommunity = (
    communityData: Community,
    isJoined: boolean
  ) => {
    // is the user authenticated
    // if not => open auth modal
    if (!user) {
      setAuthModalState({ open: true, view: 'login' })
      return
    }
    setLoading(true)
    if (isJoined) {
      leaveCommunity(communityData.id)
      return
    }
    joinCommunity(communityData)
  }

  const getCommunityData = async (communityId: string) => {
    try {
      const communityDocRef = doc(firestore, 'communities', communityId)
      const communityDoc = await getDoc(communityDocRef)

      setCommunityStateValue(prev => ({
        ...prev,
        currentCommunity: {
          id: communityDoc.id,
          ...communityDoc.data()
        } as Community
      }))
    } catch (error: any) {
      console.log('getCommunityData error', error)
    }
  }

  useEffect(() => {
    const { communityId } = router.query
    if (communityId && !communityStateValue.currentCommunity)
      getCommunityData(communityId as string)
  }, [router.query, communityStateValue.currentCommunity])

  useEffect(() => {
    if (!user) {
      setCommunityStateValue(prev => ({
        ...prev,
        mySnippets: []
      }))
    }
    getMySnippets()
  }, [user])

  return {
    // data and functions
    communityStateValue,
    onJoinOrLeaveCommunity,
    loading
  }
}
export default useCommunityData
