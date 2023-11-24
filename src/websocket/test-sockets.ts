import { io } from 'socket.io-client';
import axios from 'axios';

let token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OSwiZmlyc3ROYW1lIjoiSGFtaWQiLCJpYXQiOjE3MDA2NTA0MzUsImV4cCI6MTcwMDczNjgzNX0.sliu_6OTA_E0raG2wK1eL0RABzHkSzy1lrTQ888-XUE';

const socket = io('http://localhost:3000', {
  extraHeaders: {
    Authorization: `${token}`,
  },
});

socket.on('connect', async () => {
  console.log('Connected to the WebSocket server');

  //on clicking comments of some post
  socket.emit('joinPostRoom', 3);

  let commentResponse = await createCommentApi();
  //on submitting comment on front-end
  if (commentResponse.success)
    socket.emit('comment', { postId: 3, commentId: commentResponse.id });
});

socket.on('newComment', (postId, commentId) => {
  console.log('Received new comment:', { postId }, { commentId });
});

socket.on('disconnect', () => {
  console.log('Disconnected from the WebSocket server');
});

class SuccessResponse {
  success: boolean;
  message: string;
  id: number;
  constructor(message = 'Post deleted successfully', id: number) {
    this.success = true;
    this.message = message;
    this.id = id;
  }
}

const createCommentApi = async (): Promise<SuccessResponse> => {
  const graphqlQuery = `
  mutation AddComment($text: String!, $postId: Float!) {
    createComment(data: { text: $text, postId: $postId }) {
  
      id
    }
  }
`;

  const data = {
    query: graphqlQuery,
    variables: {
      postId: 3,
      text: 'Hello from the client 3!',
    },
  };

  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  let response = await axios.post('http://localhost:3000/graphql', data, {
    headers,
  });

  return {
    ...response.data.data?.createComment,
    id: response.data.data?.createComment?.id,
  };
};
