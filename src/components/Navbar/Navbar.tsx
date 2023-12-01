import { Center, Flex, Image } from '@chakra-ui/react'
import React from 'react'
import SearchInputs from './SearchInputs'
import RightContent from './RightContent/RightContent'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '@/firebase/clientApp'
import Directory from './Directory/Directory'
import useDirectory from '@/hooks/useDirectory'
import { defaultMenuItem } from '@/atoms/directoryMenuAtom'

export default function Navbar () {
  const [user, loading, error] = useAuthState(auth)
  const { onSelectMenuItem } = useDirectory()
  return (
    <Flex
      bg='white'
      height='44px'
      padding='6px 12px'
      justify={{ md: 'space-between' }}
    >
      <Flex
        align='center'
        width={{ base: '40px', md: 'auto' }}
        mr={{ base: 0, md: 2 }}
        cursor='pointer'
        onClick={() => {
          console.log('This triggered')
          onSelectMenuItem(defaultMenuItem)
        }}
      >
        <Image src='/images/ripplelogo.svg' height='38px'></Image>
        <Image
          src='/images/ripplename.png'
          height='46px'
          display={{ base: 'none', md: 'unset' }}
          p='8px'
        ></Image>
      </Flex>
      {user && <Directory />}
      <SearchInputs user={user} />
      <RightContent user={user} />
    </Flex>
  )
}
