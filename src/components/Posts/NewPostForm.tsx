import React, { useState } from 'react'
import { BiPoll } from 'react-icons/bi'
import { BsLink45Deg, BsMic } from 'react-icons/bs'
import { IoDocumentText, IoImageOutline } from 'react-icons/io5'
import { AiFillCloseCircle } from 'react-icons/ai'
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Flex,
  Icon,
  Text
} from '@chakra-ui/react'
import TabItem from './TabItem'
import TextInputs from './PostForm/TextInputs'
import ImageUpload from './PostForm/ImageUpload'
import { Post } from '@/atoms/postAtom'
import { User } from 'firebase/auth'
import { useRouter } from 'next/router'
import {
  Timestamp,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { firestore, storage } from '@/firebase/clientApp'
import { getDownloadURL, ref, uploadString } from 'firebase/storage'
import useSelectFile from '@/hooks/useSelectFile'

const formTabs = [
  {
    title: 'Post',
    icon: IoDocumentText
  },
  {
    title: 'Images & Video',
    icon: IoImageOutline
  },
  {
    title: 'Link',
    icon: BsLink45Deg
  },
  {
    title: 'Poll',
    icon: BiPoll
  },
  {
    title: 'Talk',
    icon: BsMic
  }
]

export type TabItems = {
  title: string
  icon: typeof Icon.arguments
}

type NewPostFormProps = {
  user: User
  communityImageURL?: string
}

const NewPostForm: React.FC<NewPostFormProps> = ({
  user,
  communityImageURL
}) => {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState(formTabs[0].title)
  const [textInputs, setTextInputs] = useState({
    title: '',
    body: ''
  })
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleCreatePost = async () => {
    if (error) setError(false)

    // get the communityId from query
    const { communityId } = router.query
    console.log(router.query)

    try {
      // store the post in db
      const postDocRef = await addDoc(collection(firestore, 'posts'), {
        communityId: communityId as string,
        creatorId: user?.uid,
        creatorDisplayName: user.email!.split('@')[0],
        title: textInputs.title,
        body: textInputs.body,
        numberOfComments: 0,
        voteStatus: 0,
        communityImageURL: communityImageURL || '',
        createdAt: serverTimestamp() as Timestamp
      })
      // check for selectedFile
      // store in storage => getDownloadedURL (return imageURL)

      setLoading(true)
      if (selectedFile) {
        const imageRef = ref(storage, `posts/${postDocRef.id}/image`)
        await uploadString(imageRef, selectedFile, 'data_url')
        const downloadURL = await getDownloadURL(imageRef)

        // update post doc by adding imageURL
        await updateDoc(postDocRef, {
          imageURL: downloadURL
        })
      }
      router.back()
    } catch (error: any) {
      console.log('handleCreatePost error', error.message)
      setError(error.message)
    }
    setLoading(false)
    // redirect the user back to the communityPage using the router
  }

  const onTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const {
      target: { name, value }
    } = event
    setTextInputs(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <Flex direction='column' bg='white' borderRadius={4} mt={2}>
      <Flex width='100%'>
        {formTabs.map(item => (
          <TabItem
            key={item.title}
            item={item}
            selected={item.title === selectedTab}
            setSelectedTab={setSelectedTab}
          />
        ))}
      </Flex>
      <Flex p={4}>
        {selectedTab === 'Post' && (
          <TextInputs
            textInputs={textInputs}
            handleCreatePost={handleCreatePost}
            onChange={onTextChange}
            loading={loading}
          />
        )}
        {selectedTab === 'Images & Video' && (
          <ImageUpload
            selectedFile={selectedFile}
            setSelectedFile={setSelectedFile}
            onSelectImage={onSelectFile}
            setSelectedTab={setSelectedTab}
          />
        )}
      </Flex>
      {error && (
        <Alert status='error'>
          <AlertIcon />
          <Text mr={2}>Error creating post</Text>
        </Alert>
      )}
    </Flex>
  )
}
export default NewPostForm
