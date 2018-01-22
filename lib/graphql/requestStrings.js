exports.createUploadString = `mutation CreateUploadMutation($input: CreateUploadInput!) {
  createUpload(input: $input) {
    upload {
      id
      url
      originalName
    }
  }
}`

exports.uploadsString = `query UploadsQuery {
  uploads {
    id
    url
    originalName
  }
}`
