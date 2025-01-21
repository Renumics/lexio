import { MarkdownViewer } from '../../../lib/components/Viewers/MarkdownViewer';

const markdownContent = `
# Markdown Example

This is a more advanced markdown example to test the rendering of different elements.


## Lists

### Unordered List

- Item 1
  - Subitem 1.1
  - Subitem 1.2
    - Sub-subitem 1.2.1
- Item 2
- Item 3

### Ordered List

1. Step 1
2. Step 2
   1. Substep 2.1
   2. Substep 2.2
3. Step 3


## Table with Alignment

| Header 1   | Header 2   | Header 3   |
|:-----------|:----------:|-----------:|
| Left-aligned | Centered | Right-aligned |
| Text 1      | Text 2    | Text 3      |
| **Bold**    | _Italic_  | ~~Strike~~  |


## Nested Elements

> Blockquote with **bold text** and _italic text_
> 
> - List inside a blockquote
> - Another item


## Links

Here is a [link to Google](https://www.google.com).

## Inline Code and Code Blocks

Inline code example: \`const a = 10;\`

### JavaScript Code Block

\`\`\`javascript
function add(a, b) {
  return a + b;
}

console.log(add(2, 3)); // Outputs 5
\`\`\`

### Python Code Block

\`\`\`python
def greet(name):
    print(f"Hello, {name}!")

greet("World")
\`\`\`

## Task Lists

- [x] Task 1
- [ ] Task 2
- [ ] Task 3


## Emojis and Special Characters

Emojis: 😀 🚀 ✨  
Special Characters: \`< > & " '\`

`;

export default {
  title: 'Viewers/MarkdownViewer',
  component: MarkdownViewer,
};

const Template = (args) => (
    <div style={{ height: '90vh' }}>
        <MarkdownViewer {...args} />
    </div>
);

export const Default = Template.bind({});
Default.args = {
  markdownContent,
};