import { Community, communityState } from '@/atoms/communitiesAtom'
import Header from '@/components/Community/Header'
import NotFound from '@/components/Community/NotFound'
import { firestore } from '@/firebase/clientApp'
import { doc, getDoc } from 'firebase/firestore'
import { GetServerSideProps, GetServerSidePropsContext } from 'next'
import React, { useEffect } from 'react'
import safeJSONStringify from 'safe-json-stringify'
import PageContent from '../../../components/Layout/PageContent'
import CreatePostLink from '@/components/Community/CreatePostLink'
import Posts from '@/components/Posts/Posts'
import { useSetRecoilState } from 'recoil'
import About from '@/components/Community/About'

type CommunityPageProps = {
  communityData: Community
}

const CommunityPage: React.FC<CommunityPageProps> = ({ communityData }) => {
  const setCommunityStateValue = useSetRecoilState(communityState)

  if (!communityData) {
    return <NotFound />
  }

  useEffect(() => {
    setCommunityStateValue(prev => ({
      ...prev,
      currentCommunity: communityData
    }))
  }, [communityData])

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  )
}

export async function getServerSideProps (context: GetServerSidePropsContext) {
  try {
    const communityDocRef = doc(
      firestore,
      'communities',
      context.query.communityId as string
    )
    const communityDoc = await getDoc(communityDocRef)

    return {
      props: {
        communityData: communityDoc.exists()
          ? JSON.parse(
              safeJSONStringify({ id: communityDoc.id, ...communityDoc.data() })
            )
          : ''
      }
    }
  } catch (error) {
    // Could add error page here
    console.log('getServerSideProps', error)
  }
}
export default CommunityPage
