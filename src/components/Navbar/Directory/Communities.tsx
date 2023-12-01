import React, { useState } from 'react'
import { Box, Flex, Icon, MenuItem, Text } from '@chakra-ui/react'
import { useAuthState } from 'react-firebase-hooks/auth'
import { GrAdd } from 'react-icons/gr'
import { useRecoilValue } from 'recoil'
import { communityState } from '../../../atoms/communitiesAtom'
import { auth } from '../../../firebase/clientApp'
import CreateCommunityModal from '@/components/Modal/CreateCommunity/CreateCommunityModal'
import MenuListItem from './MenuListItem'
import { SiFoodpanda } from 'react-icons/si'

type CommunitiesProps = {}

const Communities: React.FC<CommunitiesProps> = () => {
  const [user] = useAuthState(auth)
  const [open, setOpen] = useState(false)
  const mySnippets = useRecoilValue(communityState).mySnippets

  return (
    <>
      <CreateCommunityModal open={open} handleClose={() => setOpen(false)} />

      <Box mt={3} mb={4}>
        <Text pl={3} mb={1} fontSize='7pt' fontWeight={500} color='gray.500'>
          MODERATING
        </Text>
        {mySnippets
          .filter(item => item.isModerator)
          .map(snippet => (
            <MenuListItem
              key={snippet.communityId}
              displayText={`r/${snippet.communityId}`}
              link={`/r/${snippet.communityId}`}
              icon={SiFoodpanda}
              iconColor='brand.100'
              imageURL={snippet.imageURL}
            />
          ))}
      </Box>
      <Box mt={3} mb={4}>
        <Text pl={3} mb={1} fontSize='7pt' fontWeight={500} color='gray.500'>
          MY COMMUNITIES
        </Text>
        <MenuItem
          width='100%'
          fontSize='10pt'
          _hover={{ bg: 'gray.100' }}
          onClick={() => setOpen(true)}
        >
          <Flex alignItems='center'>
            <Icon fontSize={20} mr={2} as={GrAdd} />
            Create Community
          </Flex>
        </MenuItem>
        {mySnippets.map(snippet => (
          <MenuListItem
            key={snippet.communityId}
            icon={SiFoodpanda}
            displayText={`r/${snippet.communityId}`}
            link={`/r/${snippet.communityId}`}
            iconColor='blue.500'
            imageURL={snippet.imageURL}
          />
        ))}
      </Box>
    </>
  )
}

export default Communities
