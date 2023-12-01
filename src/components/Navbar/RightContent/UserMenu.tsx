import {
  Menu,
  MenuButton,
  Button,
  MenuList,
  MenuItem,
  Icon,
  Flex,
  Text
} from '@chakra-ui/react'
import { User, signOut } from 'firebase/auth'
import React from 'react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { VscAccount } from 'react-icons/vsc'
import { CgProfile } from 'react-icons/cg'
import { MdOutlineLogout } from 'react-icons/md'
import { auth } from '@/firebase/clientApp'
import { authModalState } from '../../../atoms/authModalAtom'
import { useSetRecoilState } from 'recoil'
import { IoSparkles } from 'react-icons/io5'
import { communityState } from '@/atoms/communitiesAtom'
import { SiFoodpanda } from 'react-icons/si'

type UserMenuProps = {
  user?: User | null
}
const UserMenu: React.FC<UserMenuProps> = ({ user }) => {
  const setAuthModalState = useSetRecoilState(authModalState)
  const logout = async () => {
    await signOut(auth)
    // clear community recoil state
    // resetCommmunityState()
  }
  return (
    <Menu>
      <MenuButton
        cursor='pointer'
        padding='0px 6px'
        borderRadius={4}
        _hover={{ outline: '1px solid', outlineColor: 'gray.200' }}
      >
        <Flex align='center'>
          <Flex align='center'>
            {user ? (
              <>
                <Icon fontSize={24} mr={1} color='gray.300' as={SiFoodpanda} />

                <Flex
                  direction='column'
                  display={{ base: 'none', lg: 'flex' }}
                  fontSize='8pt'
                  align='flex-start'
                  mr={8}
                >
                  <Text fontWeight={700}>
                    {user?.displayName || user.email?.split('@')[0]}
                  </Text>
                  <Flex>
                    <Icon as={IoSparkles} color='brand.100' mr={1} />
                    <Text color='gray.400'>1 karma</Text>
                  </Flex>
                </Flex>
              </>
            ) : (
              <Icon fontSize={24} color='gray.400' mr={1} as={VscAccount} />
            )}
            <ChevronDownIcon />
          </Flex>
        </Flex>
      </MenuButton>
      <MenuList>
        {user ? (
          <>
            <MenuItem
              fontSize='10pt'
              fontWeight={700}
              _hover={{ bg: 'blue.500', color: 'white' }}
            >
              <Flex align='center'>
                <Icon fontSize={20} mr={2} as={CgProfile} />
                Profile
              </Flex>
            </MenuItem>
            <MenuItem
              fontSize='10pt'
              fontWeight={700}
              _hover={{ bg: 'blue.500', color: 'white' }}
              onClick={logout}
            >
              <Flex align='center'>
                <Icon fontSize={20} mr={2} as={MdOutlineLogout} />
                Log Out
              </Flex>
            </MenuItem>
          </>
        ) : (
          <>
            <MenuItem
              fontSize='10pt'
              fontWeight={700}
              _hover={{ bg: 'blue.500', color: 'white' }}
              onClick={() => setAuthModalState({ open: true, view: 'login' })}
            >
              <Flex align='center'>
                <Icon fontSize={20} mr={2} as={MdOutlineLogout} />
                Log In / Sign Up
              </Flex>
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  )
}
export default UserMenu
