"use strict";

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

const getKey = ({ directory, file }) => {
	const name = file.name || 'unknown-file';
	const hash = file.hash || 'no-hash';
	const ext = file.ext || '.bin';
	const dir = directory || '';
  
	return `${dir}/${name}-${hash}${ext}`.replace(/(^\/)|(\/$)/g, '');
};

module.exports = {
	provider: 'strapi-provider-upload-supabase',
	name: 'Supabase Storage (local provider with uploadStream)',
	auth: {
		apiUrl: { label: "Supabase API Url", type: 'text' },
		apiKey: { label: "Supabase API Key", type: 'text' },
		bucket: { label: "Supabase storage bucket", type: 'text' },
		directory: { label: "Directory inside Supabase storage bucket", type: 'text' },
		options: { label: "Supabase client additional options", type: 'object' },
	},
	init: (config) => {
		// Log provider init so we can confirm Strapi loaded this local provider
		console.log('🚀 Initializing LOCAL Supabase upload provider with config:', {
			apiUrl: config.apiUrl,
			bucket: config.bucket || 'strapi-uploads',
			directory: config.directory || ''
		});
    
		try {
			/* global strapi */
			if (typeof strapi !== 'undefined' && strapi.log && typeof strapi.log.info === 'function') {
				strapi.log.info('Initializing local Supabase upload provider (supabase-local)');
			}
		} catch (e) {
			// ignore
		}
		const apiUrl = config.apiUrl;
		const apiKey = config.apiKey;
		const bucket = config.bucket || 'strapi-uploads';
		const directory = (config.directory || '').replace(/(^\/)|(\/$)/g, '');
		const options = config.options || undefined;

		const supabase = createClient(apiUrl, apiKey, options);

		const uploadBuffer = (file) => {
			const fileKey = getKey({ directory, file });
			console.log('📤 Uploading to Supabase:', {
				bucket,
				fileKey,
				bufferSize: file.buffer?.length,
				contentType: file.mime
			});
      
			return supabase.storage
				.from(bucket)
				.upload(fileKey, Buffer.from(file.buffer, 'binary'), {
					cacheControl: 'public, max-age=31536000, immutable',
					upsert: true,
					contentType: file.mime,
				})
				.then(result => {
					console.log('📤 Supabase upload result:', {
						success: !result.error,
						error: result.error?.message,
						data: result.data ? {
							path: result.data.path,
							id: result.data.id,
							fullPath: result.data.fullPath
						} : null
					});
					return result;
				});
		};

		return {
			isPrivate: () => false,
			getSignedUrl: (file) => {
				console.log('📝 getSignedUrl called for:', file?.name || 'unnamed file');
				return { url: file.url, isPrivate: false };
			},
      
			upload: (file, customParams = {}) =>
				new Promise((resolve, reject) => {
					console.log('📤 LOCAL PROVIDER upload() called with file:', {
						name: file.name,
						hash: file.hash,
						mime: file.mime,
						size: file.size
					});
          
					// Defensive: ensure we have a hash to work with. Strapi normally provides one
					if (!file.hash) {
						// create a random base and then md5 it so naming stays compact
						file.hash = crypto.randomBytes(8).toString('hex');
						console.log('🔧 upload(): file.hash was missing, generated:', file.hash);
					}

					// Always convert to string when hashing to avoid TypeErrors
					file.hash = crypto.createHash('md5').update(String(file.hash)).digest('hex');
					uploadBuffer(file)
						.then(({ data, error }) => {
							if (error) {
								console.error('❌ Upload failed:', error);
								return reject(error);
							}
              
							const fileKey = getKey({ directory, file });
							const { data: urlData } = supabase.storage
								.from(bucket)
								.getPublicUrl(fileKey);
              
							file.url = urlData?.publicUrl || `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`;
              
							console.log('✅ Upload result:', { 
								fileKey, 
								publicUrl: urlData?.publicUrl, 
								fallbackUrl: `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`,
								finalUrl: file.url 
							});
              
							console.log('🔗 Final file object before resolve (upload method):', {
								name: file.name,
								url: file.url,
								hash: file.hash,
								ext: file.ext,
								mime: file.mime,
								size: file.size
							});
              
							// Ensure URL is definitely set before resolving (log if fallback used)
							if (!file.url) {
								console.error('❌ URL is still null/undefined in upload method — using fallback URL');
								file.url = `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`;
							} else if (file.url === `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`) {
								console.warn('⚠️ Using fallback constructed URL for file:', file.url);
							}

							// Resolve with the final file object so Strapi persists the URL
							resolve(file);
						})
						.catch((error) => {
							console.error('❌ Upload catch error:', error);
							reject(error);
						});
				}),

			// Implement uploadStream: accept a readable stream and upload to Supabase without writing to disk
			uploadStream: (stream, file, customParams = {}) =>
				new Promise(async (resolve, reject) => {
					try {
						console.log('🌊 LOCAL PROVIDER uploadStream() called with:', {
							hasStream: !!stream,
							streamType: typeof stream,
							streamConstructor: stream?.constructor?.name,
							file: file ? {
								name: file.name,
								hash: file.hash,
								mime: file.mime,
								size: file.size,
								ext: file.ext
							} : 'null/undefined',
							customParams: customParams,
							argumentsLength: arguments.length,
							allArgs: Array.from(arguments).map((arg, i) => ({
								index: i,
								type: typeof arg,
								constructor: arg?.constructor?.name,
								isFile: arg && typeof arg === 'object' && ('name' in arg || 'hash' in arg || 'mime' in arg)
							}))
						});
            
						// Find the actual file object and stream data among all arguments
						let actualFile = null;
						let actualStream = null;
            
						for (let i = 0; i < arguments.length; i++) {
							const arg = arguments[i];
							console.log(`🔍 Analyzing argument ${i}:`, {
								type: typeof arg,
								constructor: arg?.constructor?.name,
								isFile: arg && typeof arg === 'object' && ('name' in arg || 'hash' in arg || 'mime' in arg),
								hasBuffer: arg && typeof arg === 'object' && 'buffer' in arg,
								hasData: arg && typeof arg === 'object' && 'data' in arg,
								keys: arg && typeof arg === 'object' && !Array.isArray(arg) ? Object.keys(arg).slice(0, 15) : []
							});
              
							// Look for file object (has name, hash, mime properties)
							if (arg && typeof arg === 'object' && ('name' in arg || 'hash' in arg || 'mime' in arg)) {
								actualFile = arg;
								console.log('✅ Found file object at argument', i);
							}
              
							// Look for stream/buffer data
							if (arg && typeof arg === 'object' && ('buffer' in arg || 'data' in arg)) {
								actualStream = arg;
								console.log('✅ Found stream/buffer object at argument', i);
							}
						}
            
						// Use found objects or fallback to original parameters
						if (actualFile) {
							file = actualFile;
							console.log('📝 Using detected file object:', {
								name: file.name,
								hash: file.hash,
								ext: file.ext,
								mime: file.mime
							});
						}
            
						if (actualStream) {
							stream = actualStream;
							console.log('🌊 Using detected stream object');
						} else {
							console.log('❌ No stream/buffer data found in any argument');
						}
            
						// Extract file information from the stream object if available
						if (stream && typeof stream === 'object') {
							console.log('📋 Extracting file metadata from stream object');
              
							// Use stream properties to populate file metadata
							if (stream.name && !file?.name) {
								file = file || {};
								file.name = stream.name;
							}
							if (stream.hash && !file?.hash) {
								file = file || {};
								file.hash = stream.hash;
							}
							if (stream.ext && !file?.ext) {
								file = file || {};
								file.ext = stream.ext;
							}
							if (stream.mime && !file?.mime) {
								file = file || {};
								file.mime = stream.mime;
							}
							if (stream.size && !file?.size) {
								file = file || {};
								file.size = stream.size;
							}
						}
            
						// Ensure file is an object with required properties
						if (!file || typeof file !== 'object') {
							file = {};
						}
            
						// Generate required file properties if missing
						if (!file.name) {
							file.name = 'uploaded-file';
						}
						if (!file.hash) {
							file.hash = crypto.randomBytes(16).toString('hex');
						}
						if (!file.ext) {
							// Try to determine extension from mime type or default to .bin
							if (file.mime) {
								const mimeToExt = {
									'image/jpeg': '.jpg',
									'image/png': '.png',
									'image/gif': '.gif',
									'image/webp': '.webp',
									'image/svg+xml': '.svg',
									'application/pdf': '.pdf',
									'text/plain': '.txt'
								};
								file.ext = mimeToExt[file.mime] || '.bin';
							} else {
								file.ext = '.bin';
							}
						}
            
						console.log('📝 Fixed file object:', {
							name: file.name,
							hash: file.hash,
							ext: file.ext,
							mime: file.mime
						});
            
						// helper: buffer different stream-like types
						const bufferFromStream = async (s) => {
							console.log('🔄 bufferFromStream input:', {
								type: typeof s,
								constructor: s?.constructor?.name,
								isBuffer: Buffer.isBuffer(s),
								hasBuffer: s && typeof s === 'object' && 'buffer' in s,
								hasData: s && typeof s === 'object' && 'data' in s,
								keys: s && typeof s === 'object' ? Object.keys(s).slice(0, 10) : []
							});
              
							if (!s) return Buffer.alloc(0);
							if (Buffer.isBuffer(s)) return s;
							if (typeof s === 'string') return Buffer.from(s);
              
							// Handle objects that wrap a stream or buffer (common shapes)
							if (s && typeof s === 'object') {
								// Check for direct buffer property first
								if (s.buffer) {
									console.log('📦 Found buffer property:', {
										bufferType: typeof s.buffer,
										isBuffer: Buffer.isBuffer(s.buffer),
										length: s.buffer.length || 'undefined'
									});
									return Buffer.isBuffer(s.buffer) ? s.buffer : Buffer.from(s.buffer);
								}
                
								// Check for data property (common in file objects)
								if (s.data) {
									console.log('📦 Found data property:', {
										dataType: typeof s.data,
										isBuffer: Buffer.isBuffer(s.data),
										length: s.data.length || 'undefined'
									});
									return Buffer.isBuffer(s.data) ? s.data : Buffer.from(s.data);
								}
                
								// Check for stream property
								if (s.stream) s = s.stream;
								else if (typeof s.createReadStream === 'function') s = s.createReadStream();
							}
              
							if (s && typeof s[Symbol.asyncIterator] === 'function') {
								console.log('🌊 Processing async iterable stream');
								const chunks = [];
								for await (const chunk of s) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
								const result = Buffer.concat(chunks);
								console.log('🌊 Async iterable result:', { length: result.length });
								return result;
							}
              
							if (s && typeof s.on === 'function') {
								console.log('🌊 Processing Node.js readable stream');
								return await new Promise((res, rej) => {
									const chunks = [];
									s.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
									s.on('end', () => {
										const result = Buffer.concat(chunks);
										console.log('🌊 Stream processing result:', { length: result.length });
										res(result);
									});
									s.on('error', (err) => rej(err));
									// ensure flowing
									if (typeof s.resume === 'function') s.resume();
								});
							}
              
							console.log('❌ Unsupported stream type, returning empty buffer');
							return Buffer.alloc(0);
						};

						file.buffer = await bufferFromStream(stream);
            
						console.log('📊 Buffer processing result:', {
							originalBufferSize: file.buffer?.length,
							hasBuffer: !!file.buffer,
							bufferType: typeof file.buffer
						});
            
						// Ensure we have a valid buffer before uploading
						if (!file.buffer || file.buffer.length === 0) {
							throw new Error('Empty or invalid file buffer');
						}
            
						file.hash = crypto.createHash('md5').update(file.hash || crypto.randomBytes(8).toString('hex')).digest('hex');

						const { data, error } = await uploadBuffer(file);
						if (error) return reject(error);

						const fileKey = getKey({ directory, file });
						const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileKey);
            
						file.url = urlData?.publicUrl || `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`;
            
						console.log('UploadStream result:', { 
							fileKey, 
							publicUrl: urlData?.publicUrl, 
							finalUrl: file.url 
						});
            
						console.log('🔗 Final file object before resolve:', {
							name: file.name,
							url: file.url,
							hash: file.hash,
							ext: file.ext,
							mime: file.mime,
							size: file.size
						});
            
						// Ensure URL is definitely set before resolving
						if (!file.url) {
							console.error('❌ URL is still null/undefined, this will cause database issues');
							file.url = `${apiUrl}/storage/v1/object/public/${bucket}/${fileKey}`;
						}

						// Resolve with the final file object so Strapi persists the URL
						resolve(file);
					} catch (e) {
						reject(e);
					}
				}),

			delete: (file, customParams = {}) =>
				new Promise((resolve, reject) => {
					supabase.storage
						.from(bucket)
						.remove([getKey({ directory, file })])
						.then(({ data, error }) => {
							if (error) return reject(error);
							resolve();
						})
						.catch((e) => reject(e));
				}),
		};
	},
};

