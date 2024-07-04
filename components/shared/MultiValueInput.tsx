"use client"
import React, { useState } from 'react'
import { FormLabel } from '../ui/form';

const MultiValueInput = ({ inputItem, setInputItem, itemArray, setItemArray, label,placeholder }:
    { inputItem: string, setInputItem: (inputItem: string) => void, itemArray: string[], setItemArray: (itemArray: string[]) => void, label: string,placeholder: string }) => {


    const addItem = (e: React.KeyboardEvent<HTMLInputElement>) => {
        const currItem = inputItem.trim().toLowerCase()
        if (e.key === 'Enter' && currItem !== '') {
            e.preventDefault();
            if (!itemArray.includes(currItem)) {

                setItemArray([...itemArray, currItem]);

                setInputItem('');
            }

        }
    };


    const removeItem = (s: string) => {
        // setSkills(skills.filter((item) => item.skillName !== s));
        setItemArray(itemArray.filter((item) => item !== s));
    };


    return (
        <>
            <FormLabel className='text-base-semibold text-black'>
                {label}
            </FormLabel>
            <input
                type="text"
                value={inputItem}
                onChange={(e) => setInputItem(e.target.value)}
                onKeyDown={addItem}
                placeholder={placeholder}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            <div className="flex flex-wrap">
                {itemArray.map((curr, index) => (
                    <div key={index} className="flex items-center bg-gray-200 text-gray-800 text-sm font-medium mr-2 mb-2 px-2 py-1 rounded overflow-y-scroll">
                        {curr}
                        <span onClick={() => removeItem(curr)} className="ml-2 cursor-pointer text-red-500">x</span>
                    </div>
                ))}
            </div>
        </>
    )
}

export default MultiValueInput