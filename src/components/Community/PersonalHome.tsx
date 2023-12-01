import React, { useState } from 'react'
import { Button, Flex, Icon, Stack, Text } from '@chakra-ui/react'
import { SiFoodpanda } from 'react-icons/si'
import useDirectory from '@/hooks/useDirectory'
import CreateCommunityModal from '../Modal/CreateCommunity/CreateCommunityModal'

const PersonalHome: React.FC = () => {
  const [openCreateCommunityModal, setOpenCreateCommunityModal] =
    useState(false)
  const { toggleMenuOption } = useDirectory()
  return (
    <>
      <CreateCommunityModal
        open={openCreateCommunityModal}
        handleClose={() => setOpenCreateCommunityModal(false)}
      />
      <Flex
        direction='column'
        bg='white'
        borderRadius={4}
        cursor='pointer'
        border='1px solid'
        borderColor='gray.300'
        position='sticky'
      >
        <Flex
          align='flex-end'
          color='white'
          p='6px 10px'
          bg='blue.500'
          height='34px'
          borderRadius='4px 4px 0px 0px'
          fontWeight={600}
          bgImage='url(/images/ripplelogo.svg)'
          backgroundSize='cover'
        ></Flex>
        <Flex direction='column' p='12px'>
          <Flex align='center' mb={2}>
            <Icon as={SiFoodpanda} fontSize={50} color='brand.100' mr={2} />
            <Text fontWeight={600}>Home</Text>
          </Flex>
          <Stack spacing={3}>
            <Text fontSize='9pt'>
              Your personal Ripple frontpage, built for you.
            </Text>
            <Button height='30px' onClick={toggleMenuOption}>
              Create Post
            </Button>
            <Button
              variant='outline'
              height='30px'
              onClick={() => setOpenCreateCommunityModal(true)}
            >
              Create Community
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </>
  )
}

export default PersonalHome
