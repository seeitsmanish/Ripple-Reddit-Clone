import { Post } from '@/atoms/postAtom'
import {
  Flex,
  Icon,
  Stack,
  Text,
  Image,
  Skeleton,
  Spinner,
  Alert,
  AlertIcon,
  useToast
} from '@chakra-ui/react'
import moment from 'moment'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { use, useState } from 'react'

import { AiOutlineDelete } from 'react-icons/ai'
import { BsChat, BsDot } from 'react-icons/bs'
import {
  IoArrowDownCircleOutline,
  IoArrowDownCircleSharp,
  IoArrowRedoOutline,
  IoArrowUpCircleOutline,
  IoArrowUpCircleSharp,
  IoBookmarkOutline
} from 'react-icons/io5'
import { SiFoodpanda } from 'react-icons/si'
import TOASTS from '../toasts'

type PostItemProps = {
  post: Post
  userIsCreator: boolean
  userVoteValue?: number
  onVote: (
    event: React.MouseEvent<SVGElement, MouseEvent>,
    post: Post,
    vote: number,
    communityId: string
  ) => void
  onDeletePost: (post: Post) => Promise<boolean>
  onSelectPost?: (post: Post) => void
  homePage?: boolean
}

const PostItem: React.FC<PostItemProps> = ({
  post,
  userIsCreator,
  userVoteValue,
  onVote,
  onDeletePost,
  onSelectPost,
  homePage
}) => {
  const [loadingImage, setLoadingImage] = useState(true)
  const [loadingDelete, setLoadingDelete] = useState(false)
  const [error, setError] = useState('')
  const singlePostPage = !onSelectPost
  const router = useRouter()
  const toast = useToast();
  const handleDelete = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    event.stopPropagation()
    setLoadingDelete(true)
    try {
      const success = await onDeletePost(post)

      if (!success) {
        throw new Error('Failed to delete post!')
      }

      console.log('Post was successfully deleted')
      if (singlePostPage) {
        router.push(`/r/${post.communityId}`)
      }
    } catch (error: any) {
      setError(error.message)
    }
    setLoadingDelete(false)
  }

  return (
    <Flex
      border='1px solid solid'
      bg='white'
      borderColor={singlePostPage ? 'white' : 'grap.300'}
      borderRadius={singlePostPage ? '4px 4px 0px 0px' : '4px'}
      _hover={{ borderColor: singlePostPage ? 'none' : 'gray.500' }}
      cursor={singlePostPage ? 'unset' : 'pointer'}
      onClick={() => onSelectPost && onSelectPost(post)}
    >
      <Flex
        direction='column'
        align='center'
        bg={singlePostPage ? 'none' : 'gray.100'}
        p={2}
        width='40px'
        borderRadius={4}
      >
        <Icon
          as={
            userVoteValue === 1 ? IoArrowUpCircleSharp : IoArrowUpCircleOutline
          }
          color={userVoteValue === 1 ? 'brand.100' : 'gray.400'}
          fontSize={22}
          onClick={event => onVote(event, post, 1, post.communityId)}
          cursor='pointer'
        />
        <Text fontSize='9pt'>{post.voteStatus}</Text>
        <Icon
          as={
            userVoteValue === -1
              ? IoArrowDownCircleSharp
              : IoArrowDownCircleOutline
          }
          color={userVoteValue === -1 ? 'downArrow' : 'gray.400'}
          fontSize={22}
          onClick={event => onVote(event, post, -1, post.communityId)}
          cursor='pointer'
        />
      </Flex>
      <Flex direction='column' width='100%'>
        {error && (
          <Alert status='error'>
            <AlertIcon />
            <Text mr={2}>{error}</Text>
          </Alert>
        )}
        <Stack spacing={1} p='10px'>
          <Stack direction='row' spacing={0.6} align='center' fontSize='9pt'>
            {/* Home Page Check */}
            {homePage && (
              <>
                {post.communityImageURL ? (
                  <Image
                    src={post.communityImageURL}
                    borderRadius='full'
                    boxSize='18px'
                    mr={2}
                  />
                ) : (
                  <Icon
                    as={SiFoodpanda}
                    fontSize='15pt'
                    mr={1}
                    color='blue.500'
                  />
                )}
                <Link href={`r/${post.communityId}`}>
                  <Text
                    fontWeight={700}
                    _hover={{ textDecoration: 'underline' }}
                    onClick={event => event.stopPropagation()}
                  >{`r/${post.communityId}`}</Text>
                </Link>
                <Icon as={BsDot} color='gray.500' fontSize={8} />
              </>
            )}
            <Text color='gray.500'>
              Posted by u/{post.creatorDisplayName}{' '}
              {moment(new Date(post.createdAt.seconds * 1000)).fromNow()}
            </Text>
          </Stack>
          <Text fontSize='12pt' fontWeight={600}>
            {post.title}
          </Text>
          <Text fontSize='10pt'>{post.body}</Text>
          {post.imageURL && (
            <Flex justify='center' align='cennter' p={2}>
              {loadingImage && (
                <Skeleton height='200px' width='100%' borderRadius={4} />
              )}
              <Image
                src={post.imageURL}
                maxHeight='460px'
                alt='Post Image'
                display={loadingImage ? 'none' : 'unset'}
                onLoad={() => setLoadingImage(false)}
              />
            </Flex>
          )}
        </Stack>
        <Flex ml={1} mb={0.5} color='gray.500' fontWeight={600}>
          <Flex
            align='center'
            p='8px 10px'
            borderRadius={4}
            _hover={{ bg: 'gray.200' }}
            cursor='pointer'
          >
            <Icon as={BsChat} mr={2} />
            <Text fontSize='9pt'>{post.numberOfComments}</Text>
          </Flex>
          <Flex
            align='center'
            p='8px 10px'
            borderRadius={4}
            _hover={{ bg: 'gray.200' }}
            cursor='pointer'
            onClick={(e) => {
              e.stopPropagation();
              toast(TOASTS.UNDER_DEVELOPMENT);
            }}
          >
            <Icon as={IoArrowRedoOutline} mr={2} />
            <Text fontSize='9pt'>Share</Text>
          </Flex>
          <Flex
            align='center'
            p='8px 10px'
            borderRadius={4}
            _hover={{ bg: 'gray.200' }}
            cursor='pointer'
            onClick={(e) => {
              e.stopPropagation();
              toast(TOASTS.UNDER_DEVELOPMENT);
            }}
          >
            <Icon as={IoBookmarkOutline} mr={2} />
            <Text fontSize='9pt'>Save</Text>
          </Flex>
          {userIsCreator && (
            <Flex
              align='center'
              p='8px 10px'
              borderRadius={4}
              _hover={{ bg: 'gray.200' }}
              cursor='pointer'
              onClick={handleDelete}
            >
              {loadingDelete ? (
                <Spinner size='sm' />
              ) : (
                <>
                  <Icon as={AiOutlineDelete} mr={2} />
                  <Text fontSize='9pt'>Delete</Text>
                </>
              )}
            </Flex>
          )}
        </Flex>
      </Flex>
    </Flex >
  )
}
export default PostItem
