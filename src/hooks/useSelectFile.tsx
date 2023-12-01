import React, { useState } from 'react'

const useSelectFile = () => {
  const [selectedFile, setSelectedFile] = useState<string>()

  const onSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const render = new FileReader()

    if (event.target.files?.[0]) {
      render.readAsDataURL(event.target.files[0])
    }

    render.onload = readerEvent => {
      if (readerEvent.target?.result) {
        setSelectedFile(readerEvent.target.result as string)
      }
    }
  }
  return {
    selectedFile,
    setSelectedFile,
    onSelectFile
  }
}
export default useSelectFile
