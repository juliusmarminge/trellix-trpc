export default function BoardPage(props: { params: { boardId: string } }) {
  return 'board' + props.params.boardId
}
