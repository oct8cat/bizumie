exports.createUploadString = `mutation CreateUploadMutation($input: CreateUploadInput!) {
  createUpload(input: $input) {
    upload {
      id
      url
      originalName
      user {
        id
      }
    }
  }
}`

exports.uploadsString = `query UploadsQuery {
  uploads {
    id
    url
    originalName
    user {
      id
    }
  }
}`

exports.meString = `query MeQuery {
  me {
    id
    displayName
  }
}`

exports.postsString = `query PostsQuery {
  posts {
    id
    title
    text
  }
}`

exports.createPostString = `mutation CreatePostMutation($input: CreatePostInput!) {
  createPost(input: $input) {
    post {
      id
      title
      text
      author {
        id
      }
    }
  }
}`
