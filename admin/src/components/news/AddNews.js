import React, { Component } from 'react';
import { inject, observer } from "mobx-react";
import { Link, withRouter } from "react-router-dom";
import Script from 'react-load-script'

import { Grid, TextArea, Button, Menu, Dropdown, Label, Input} from 'semantic-ui-react'

// for editor
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { EditorState, convertToRaw, ContentState } from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import htmlToDraft from 'html-to-draftjs';

//for image
import uploadImage from '../../lib/uploadImage';

@withRouter
@inject("store")
@observer
class AddNews extends Component {

    constructor(props) {
        super(props);
        this.store = this.props.store;

        const html = '';
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

    handleCancel = (e) => {
        const { history } = this.props;
        history.push('/news');
    }

    handleSubmit = (e) => {
        const { history } = this.props;

        // TODO: check title
        this.store.newsState.title = document.getElementById('title').value;

        // TODO: check admin login
        this.store.newsState.addNews(document.getElementById('newsData').value, history);
    }

    handleDropdown = (e,{value}) => {
        //console.log(value);
        this.store.newsState.category = value;
    }

    render() {
        const { editorState } = this.state;
        const friendOptions = [
            {text: 'maintenance', value: 'maintenance'},
            {text: 'news', value: 'news'},
            {text: 'event', value: 'event'},
        ]
        return (
            <div>
                <Grid textAlign='center'  >
                    <Grid.Row verticalAlign='middle' >
                        <Grid.Column style={{ maxWidth: 850, marginTop: '3em'  }}>
                            <h1>Add News</h1>
                            <hr />
                            <div>
                                <Dropdown 
                                    id='category' 
                                    placeholder='Select category' 
                                    fluid selection options={friendOptions} 
                                    onChange={this.handleDropdown}
                                    />
                            </div>
                            <div>
                                <Input fluid id='title' placeholder='Input title...'></Input>
                            </div>
                            <Editor 
                                editorState={editorState}
                                wrapperClassName="demo-wrapper"
                                editorClassName="demo-editor"
                                toolbarClassName="toolbar-class"
                                onEditorStateChange={this.onEditorStateChange}
                                placeholder='input here...'
                                toolbar={{
                                    inline: { inDropdown: true },
                                    list: { inDropdown: true },
                                    textAlign: { inDropdown: true },
                                    link: { inDropdown: true },
                                    history: { inDropdown: true },
                                    image: { uploadCallback: uploadImage.uploadImageCallBack, alt: { present: true, mandatory: true } },
                                  }
                                }
                            />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <Grid textAlign='center' columns={3}>
                    <Grid.Row verticalAlign='middle' style={{ maxWidth: 850}}>
                        <Grid.Column>
                            <div>
                                <Button basic color='red' fluid size='small' onClick={this.handleCancel}>CANCEL</Button>
                            </div>
                        </Grid.Column>
                        <Grid.Column>
                            <div>
                                <Button basic color='violet' fluid size='small' onClick={this.handleSubmit}>SUBMIT</Button>
                            </div>
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <TextArea id='newsData'
                    disabled
                    hidden
                    value={draftToHtml(convertToRaw(editorState.getCurrentContent()))}
                />
            </div>
        );
      }
}


export default AddNews;