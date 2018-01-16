import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

import { Grid, TextArea, Button} from 'semantic-ui-react'

// for editor
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

@withRouter
@inject("store")
@observer
class AddNews extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;

        const html = 'input here...';
        const contentBlock = htmlToDraft(html);
        if (contentBlock) {
        const contentState = ContentState.createFromBlockArray(contentBlock.contentBlocks);
        const editorState = EditorState.createWithContent(contentState);
        this.state = {
            editorState,
        };
        }
    }

    onEditorStateChange = (editorState) => {
        this.setState({
            editorState,
        });

        //console.log(editorState);
    };

    componentDidMount() {
        //this.store.newsState.fetchNewsData();
    }

    render() {
        const { editorState } = this.state;
        return (
            <div>
                <Grid textAlign='center' style={{ height: '100%' }} >
                    <Grid.Row verticalAlign='middle' >
                        <Grid.Column style={{ maxWidth: 850, marginTop: '5em'  }}>
                            <h1>Add News</h1>
                            <hr />
                            <Editor 
                                editorState={editorState}
                                wrapperClassName="home-wrapper"
                                editorClassName="home-editor"
                                toolbarClassName="toolbar-class"
                                onEditorStateChange={this.onEditorStateChange}
                            />
                        </Grid.Column>
                    </Grid.Row>
                    <Grid.Row verticalAlign='bottom' >
                        <Grid.Column width={3}>
                            <Button color='violet' fluid size='small' >SUBMIT</Button>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <TextArea
                    disabled
                    hidden
                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                />
            </div>
        );
      }
}


export default AddNews;