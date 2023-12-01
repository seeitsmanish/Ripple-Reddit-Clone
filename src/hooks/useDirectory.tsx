import {
  DirectoryMenuItem,
  defaultMenuItem,
  directoryMenuState
} from '@/atoms/directoryMenuAtom'
import { useRouter } from 'next/router'
import React, { useEffect } from 'react'
import { FaReddit } from 'react-icons/fa'
import { useRecoilState, useRecoilValue } from 'recoil'
import useCommunityData from './useCommunityData'
import { communityState } from '@/atoms/communitiesAtom'

const useDirectory = () => {
  const [directoryState, setDirectoryState] = useRecoilState(directoryMenuState)
  const communityStateValue = useRecoilValue(communityState)
  const router = useRouter()
  const onSelectMenuItem = (menuItem: DirectoryMenuItem) => {
    setDirectoryState(prev => ({
      ...prev,
      selectedMenuItem: menuItem
    }))
    router.push(menuItem.link)
    if (directoryState.isOpen) {
      toggleMenuOption()
    }
  }
  const toggleMenuOption = () => {
    setDirectoryState(prev => ({
      ...prev,
      isOpen: !directoryState.isOpen
    }))
  }

  return { directoryState, toggleMenuOption, onSelectMenuItem }
}
export default useDirectory
