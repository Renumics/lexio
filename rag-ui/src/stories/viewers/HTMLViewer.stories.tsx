import { HtmlViewer } from '../../../lib/components/Viewers/HtmlViewer';
import {useEffect, useState} from "react";

const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
    <header>
        <h1>Base Styling Test</h1>
    </header>
    <main>
        <h2>Heading Level 2</h2>
        <h3>Heading Level 3</h3>
        <p>This is a paragraph to test the base styling. <a href="#">This is a link</a>.</p>
        <p>Another paragraph to check spacing and font styling.</p>
    </main>
    <footer>
        <p>Footer Content</p>
    </footer>
</body>
</html>
`;

export default {
  title: 'Viewers/HtmlViewer',
  component: HtmlViewer,
};

const Template = (args) => {
    return (
        <div style={{height: '90vh'}}>
            <HtmlViewer {...args}/>
        </div>);
}

export const Default = Template.bind({});
Default.args = {
    htmlContent: htmlContent,
};
