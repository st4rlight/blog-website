import React, { Component } from 'react';
import './FileType.scss';
import { createFromIconfontCN, CloseCircleFilled } from '@ant-design/icons';


interface FileTypeProps{
    file: File
    index: number
    handleRemoveFile: (index: number) => void
}

interface FileTypeState{
    hover: boolean
}

const IconFont = createFromIconfontCN({
    scriptUrl: [
        '//at.alicdn.com/t/font_1934854_azelnlb9st4.js'
    ],
});
  

export default class FileType extends Component<FileTypeProps, FileTypeState>{
    constructor(props: FileTypeProps){
        super(props);

        this.state = {
            hover: false
        }
    }

    handleFileType(){
        switch(this.props.file.type){
            case "application/pdf":
                return "pdf";
            case "application/x-zip-compressed":
                return "zip";
            case "image/jpeg":
                return "jpg";
            case "application/msword":
            case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                return "word";
            case "application/vnd.ms-excel":
            case "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                return "excel";
            case "application/vnd.ms-powerpoint":
            case "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                return "ppt";
            default:
                return "file";
        }
    }

    handleRemoveFile(){
        this.props.handleRemoveFile(this.props.index)
    }

    render(){
        return (
            <span className="file-type-container" onMouseEnter={() => this.setState({hover: true})} onMouseLeave={() => this.setState({hover: false})}>
                <CloseCircleFilled className={`close-button ${this.state.hover ? "close-icon-active" : null}`.trim()} onClick={this.handleRemoveFile.bind(this)} />
                <IconFont type={`icon-${this.handleFileType()}`} className="file-type-image" />
                <span className="file-name-container">
                    { this.props.file.name }
                </span>
            </span>
        )
    }
}