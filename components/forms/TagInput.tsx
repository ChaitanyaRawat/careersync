import { useState } from 'react';


interface TagInputProps {
    tags: string[];
    setTags: (tags: string[]) => void;
}

const TagInput: React.FC<TagInputProps> = ({ tags, setTags }) => {
    const [input, setInput] = useState('');
    const [validTag, setvalidTag] = useState(true)
    
    

    const addTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currTag = input.trim().toLowerCase()

        if (e.key === 'Enter' && currTag !== '') {
            e.preventDefault();
            if (!tags.includes(currTag)  && !/\s/.test(currTag)) {
                setTags([...tags, currTag]);
                setInput('');
            }
            else{
                setvalidTag(false)
                // add a delay
                setTimeout(() => {
                    setvalidTag(true)
                }, 2000)
                
            }
        }
    };

    const removeTag = (tag: string) => {
        setTags(tags.filter(t => t !== tag));
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap">
                {tags.map((tag, index) => (
                    <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded">
                        {tag}
                        <span onClick={() => removeTag(tag)} className="ml-2 cursor-pointer text-red-500">x</span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={addTag}
                placeholder="Add tags"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <p className={`text-red-500 ${validTag ? 'hidden' : 'block'}`}>please enter a valid tag</p>
        </div>
    );
};

export default TagInput;