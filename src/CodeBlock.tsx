import SyntaxHighlighter from 'react-syntax-highlighter'
import darcula from 'react-syntax-highlighter/dist/esm/styles/hljs/darcula'

export function CodeBlock(props: { value: string; language?: string }) {
  const { language, value } = props
  return (
    <SyntaxHighlighter language={language} style={codeHighlightingStyle}>
      {value}
    </SyntaxHighlighter>
  )
}

const codeHighlightingStyle = {
  ...darcula,
  hljs: {
    display: 'block',
    overflowX: 'auto',
    background: '#090807',
    color: '#e9e8e7',
  },
}

export default CodeBlock
