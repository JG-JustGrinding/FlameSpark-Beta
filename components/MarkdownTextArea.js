
import React, { useState } from "react";
import { useRef } from "react";
import "./MarkdownTextArea.css"
import CappedInput from "./CappedInput";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';


export default function MarkdownTextArea({
	value,
	onChange,
	placeholder = "Add a comment...",
	maxLength = 1000,
	className = "comment-input",
    disabled = false,
	id = "comment-input",
	noMinHeight = true,
	children,
    submitButton = false,
    submitButtonDisabled = false,
    submitFunction = null,
}) {
    const [selectedStyling, setSelectedStyling] = useState("");
    const textareaRef = useRef(null);

    function applyFormat(type) {
        const textarea = textareaRef.current;
        if (!textarea) return;

        if (selectedStyling == type && (type == "ulist" || type == "olist")) {
            setSelectedStyling("");
            return;
        } else {
            setSelectedStyling(type);
        }

        const cleanSelected = () => {
            if (selected.endsWith(" ")) {
                addSpace = " ";
                return selected.slice(0, -1);
            }

            return selected;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        let newText = '';
        let cursorPos = null;
        let addSpace = "";

        switch (type) {
            case 'bold':
            newText = `**${cleanSelected(selected) || ''}**${addSpace}`;
            cursorPos = cleanSelected(selected) ? start + newText.length : start + 2;
            break;
            case 'italic':
            newText = `*${cleanSelected(selected) || ''}*${addSpace}`;
            cursorPos = cleanSelected(selected) ? start + newText.length : start + 1;
            break;
            case 'underline':
            newText = `__${cleanSelected(selected) || ''}__${addSpace}`;
            cursorPos = cleanSelected(selected) ? start + newText.length : start + 2;
            break;
            case 'strike':
            newText = `~~${cleanSelected(selected) || ''}~~${addSpace}`;
            cursorPos = cleanSelected(selected) ? start + newText.length : start + 2;
            break;
            case 'code':
            newText = `\`${selected || ''}\`${addSpace}`;
            cursorPos = selected ? start + newText.length : start + 1;
            break;
            case 'link':
            newText = `[${cleanSelected(selected) || 'Link Text'}](https://)`;
            // place cursor *inside* parentheses
            cursorPos = start + newText.indexOf('(') + 1;
            break;
            case 'quote': {
                // ensure start on a new line
                const prefix = start === 0 || textarea.value[start - 1] === '\n' ? '' : '\n';
                newText = `${prefix}> ${selected || ''}`;
                cursorPos = start + newText.length;
                break;
            }
            case 'ulist': {
                const prefix = start === 0 || textarea.value[start - 1] === '\n' ? '' : '\n';
                if (selected.includes('\n')) {
                newText = prefix + selected
                    .split('\n')
                    .map(line => (line.trim() ? `- ${line}` : ''))
                    .join('\n');
                } else {
                newText = prefix + `- ${selected || ''}`;
                }
                cursorPos = start + newText.length;
                break;
            }
            case 'olist': {
                const prefix = start === 0 || textarea.value[start - 1] === '\n' ? '' : '\n';
                if (selected.includes('\n')) {
                const lines = selected.split('\n');
                newText = prefix + lines
                    .map((line, i) => (line.trim() ? `${i + 1}. ${line}` : ''))
                    .join('\n');
                } else {
                newText = prefix + `1. ${selected || ''}`;
                }
                cursorPos = start + newText.length;
                break;
            }
        }

        // Replace the selected text with newText
        textarea.setRangeText(newText, start, end, 'end');

        // Set cursor position precisely
        textarea.focus();
        if (cursorPos !== null) {
            textarea.setSelectionRange(cursorPos, cursorPos);
        }

        // Trigger onChange event to update parent state
        const event = new Event('input', { bubbles: true });
        textarea.dispatchEvent(event);
    }

    function handleEnter(e) {
        const textarea = textareaRef.current;
            if (!textarea) return;

            // Only handle Enter if a list is active
            if (e.key !== "Enter" || !(selectedStyling === "ulist" || selectedStyling === "olist")) {
                return;
            }

            e.preventDefault();

            const { selectionStart } = textarea;
            const value = textarea.value;

            // Get current line
            const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
            const line = value.substring(lineStart, selectionStart);

            if (selectedStyling === "ulist") {
                const match = line.match(/^(\s*)- /);
                const prefix = match ? match[1] + "- " : "- ";
                insertTextAtCursor(textarea, "\n" + prefix);
            } else if (selectedStyling === "olist") {
                const match = line.match(/^(\s*)(\d+)\. /);
                const num = match ? parseInt(match[2]) + 1 : 1;
                const prefix = (match ? match[1] : "") + num + ". ";
                insertTextAtCursor(textarea, "\n" + prefix);
            }
        }

    // Helper to insert text at cursor
    function insertTextAtCursor(textarea, text) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.setRangeText(text, start, end, "end");
        textarea.setSelectionRange(start + text.length, start + text.length);
        textarea.focus();
    }

	return (
		<CappedInput
			value={value}
			onChange={onChange}
			placeholder={placeholder}
			maxLength={maxLength}
			isTextArea={true}
			className={`markdown ${disabled ? "disabled" : ""} ${className}`}
			id={id}
            disabled={disabled}
			noMinHeight={noMinHeight}
            ref={textareaRef}
            keyDown={handleEnter}
		>
			<div className={`input-options${disabled ? " disabled" : ""}`}>
				<div className="rich-text">
					<button className="rich-text-button bodyFont" title="Bold" onClick={() => {applyFormat('bold');}}><b>B</b></button>
					<button className="rich-text-button bodyFont" title="Italic" onClick={() => {applyFormat('italic');}}><i>I</i></button>
					<button className="rich-text-button bodyFont" title="Underline" onClick={() => {applyFormat('underline');}}><u>U</u></button>
					<button className="rich-text-button bodyFont" title="Strikethrough" onClick={() => {applyFormat('strike');}}><s>S</s></button>
					<button className="rich-text-button bodyFont" title="Link" onClick={() => {applyFormat('link');}}>🔗</button>
                    <button className="rich-text-button bodyFont" title="Quote" onClick={() => {applyFormat('quote');}}>"</button>
                    <button className="rich-text-button bodyFont" title="Code" onClick={() => {applyFormat('code');}}><code>{"</>"}</code></button>
					<button className={`rich-text-button bodyFont${selectedStyling == "ulist" ? " selected" : ""}`} title="Bullet List" onClick={() => {applyFormat('ulist');}}>• List</button>
					<button className={`rich-text-button bodyFont${selectedStyling == "olist" ? " selected" : ""}`} title="Numbered List" onClick={() => {applyFormat('olist');}}>1. List</button>
				</div>
				{submitButton && <div className="submit-section">
					<FontAwesomeIcon icon={faArrowRight} className={`no-select-pointer${(value || submitButtonDisabled) ? "" : " disabled"}`} onClick={submitFunction} />
				</div> }
			</div>
			{children}
		</CappedInput>
	);
}
