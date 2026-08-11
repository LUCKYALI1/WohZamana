import{i as e,n as t,r as n,t as r}from"./index-BgTH5VMt.js";var i=e(n(),1),a=t();function o(){let[e,t]=(0,i.useState)({title:``,artist:``,album:``}),[n,o]=(0,i.useState)(null),[s,c]=(0,i.useState)(null),[l,u]=(0,i.useState)(!1),[d,f]=(0,i.useState)(``),p=e=>{let{name:n,value:r}=e.target;t(e=>({...e,[n]:r}))};return(0,a.jsx)(`div`,{className:`min-h-screen bg-black text-white flex items-center justify-center p-6`,children:(0,a.jsxs)(`div`,{className:`max-w-md w-full bg-zinc-900/80 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl`,children:[(0,a.jsx)(`h2`,{className:`text-2xl font-bold mb-6 text-rose-200 tracking-wide text-center`,children:`Admin - Upload Song`}),d&&(0,a.jsx)(`p`,{className:`mb-4 text-xs font-mono text-center p-3 rounded-xl bg-white/5 border border-white/10`,children:d}),(0,a.jsxs)(`form`,{onSubmit:async i=>{if(i.preventDefault(),!n||!s){f(`❌ Please select both audio and cover files.`);return}u(!0),f(``);let a=new FormData;a.append(`title`,e.title),a.append(`artist`,e.artist),a.append(`album`,e.album),a.append(`audio`,n),a.append(`cover`,s);try{await r(a),f(`🎉 Song uploaded successfully!`),t({title:``,artist:``,album:``}),o(null),c(null),i.target.reset()}catch(e){console.error(`Upload error:`,e);let t=e?.message||e?.error||`Server error during upload.`;f(`❌ Upload failed: ${t}`)}finally{u(!1)}},className:`flex flex-col gap-4`,children:[(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`label`,{className:`text-xs text-white/60 mb-1 block`,children:`Song Title`}),(0,a.jsx)(`input`,{type:`text`,name:`title`,required:!0,value:e.title,onChange:p,placeholder:`e.g. Bas Ek Sanam Chahiye`,className:`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`label`,{className:`text-xs text-white/60 mb-1 block`,children:`Artist Name`}),(0,a.jsx)(`input`,{type:`text`,name:`artist`,required:!0,value:e.artist,onChange:p,placeholder:`e.g. Kumar Sanu`,className:`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`label`,{className:`text-xs text-white/60 mb-1 block`,children:`Album Name (Optional)`}),(0,a.jsx)(`input`,{type:`text`,name:`album`,value:e.album,onChange:p,placeholder:`e.g. Aashiqui (1990)`,className:`w-full bg-black/50 border border-white/10 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-rose-500`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`label`,{className:`text-xs text-white/60 mb-1 block`,children:`Cover Image (JPG/PNG)`}),(0,a.jsx)(`input`,{type:`file`,accept:`image/jpeg,image/png,image/webp`,required:!0,onChange:e=>c(e.target.files[0]),className:`w-full text-xs text-white/70
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-xl
                file:border-0
                file:text-xs
                file:bg-white/10
                file:text-white
                hover:file:bg-white/20
                cursor-pointer`})]}),(0,a.jsxs)(`div`,{children:[(0,a.jsx)(`label`,{className:`text-xs text-white/60 mb-1 block`,children:`Audio File (MP3)`}),(0,a.jsx)(`input`,{type:`file`,accept:`audio/mpeg,audio/mp3,audio/wav`,required:!0,onChange:e=>o(e.target.files[0]),className:`w-full text-xs text-white/70
                file:mr-4
                file:py-2
                file:px-4
                file:rounded-xl
                file:border-0
                file:text-xs
                file:bg-white/10
                file:text-white
                hover:file:bg-white/20
                cursor-pointer`})]}),(0,a.jsx)(`button`,{type:`submit`,disabled:l,className:`mt-4 w-full py-3 bg-white text-black font-semibold rounded-xl hover:bg-rose-100 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`,children:l?`Uploading to Cloud...`:`Upload Track`})]})]})})}export{o as default};