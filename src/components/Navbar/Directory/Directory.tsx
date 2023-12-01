import { ChevronDownIcon } from '@chakra-ui/icons'
import {
  Flex,
  Icon,
  Menu,
  MenuButton,
  MenuList,
  Text,
  Image,
  useOutsideClick
} from '@chakra-ui/react'
import React, { useEffect, useRef } from 'react'
import { TiHome } from 'react-icons/ti'
import Communities from './Communities'
import useDirectory from '@/hooks/useDirectory'
const Directory: React.FC = () => {
  const { directoryState, toggleMenuOption } = useDirectory()
  const ref = useRef(null)
  useOutsideClick({
    ref: ref,
    handler: () => {
      if (directoryState.isOpen) {
        toggleMenuOption()
      }
    }
  })

  useEffect(() => {
    console.log('Here it is', directoryState.selectedMenuItem)
  }, [directoryState.selectedMenuItem])
  return (
    <Menu isOpen={directoryState.isOpen}>
      <MenuButton
        cursor='pointer'
        padding='0px 6px'
        borderRadius={4}
        _hover={{ outline: '1px solid', outlineColor: 'gray.200' }}
        onClick={toggleMenuOption}
      >
        <Flex
          align='center'
          justify='space-between'
          width={{ base: 'auto', lg: '200px' }}
        >
          <Flex align='center'>
            {directoryState.selectedMenuItem.imageURL ? (
              <Image
                src={directoryState.selectedMenuItem.imageURL}
                mr={{ base: 1, md: 2 }}
                borderRadius='full'
                boxSize='20pt'
              />
            ) : (
              <Icon fontSize={24} mr={{ base: 1, md: 2 }} as={TiHome} />
            )}
            <Flex display={{ base: 'none', lg: 'flex' }}>
              <Text fontWeight={600} fontSize='10pt'>
                {directoryState.selectedMenuItem.displayText}
              </Text>
            </Flex>
          </Flex>
          <ChevronDownIcon />
        </Flex>
      </MenuButton>
      <div ref={ref}>
        <MenuList>
          <Communities />
        </MenuList>
      </div>
    </Menu>
  )
}
export default Directory
