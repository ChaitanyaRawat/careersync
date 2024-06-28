import { useState } from 'react';


interface URLInputProps {
    urls: string[];
    setUrls: (URLS: string[]) => void;
}

const PostUrl: React.FC<URLInputProps> = ({ urls, setUrls }) => {
    const [input, setInput] = useState('');
   
    
    

    const addUrl = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currUrl = input.trim().toLowerCase()

        if (e.key === 'Enter' && currUrl !== '') {
            e.preventDefault();
            if (!urls.includes(currUrl)) {
                setUrls([...urls, currUrl]);
                setInput('');
            }
           
        }
    };

    const removeUrl = (url: string) => {
        setUrls(urls.filter(t => t !== url));
    };

    return (
        <div className="mb-4">
            <div className="flex flex-wrap">
                {urls.map((url, index) => (
                    <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded">
                        {url}
                        <span onClick={() => removeUrl(url)} className="ml-2 cursor-pointer text-red-500">x</span>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={addUrl}
                placeholder="Add a Url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            
        </div>
    );
};

export default PostUrl;