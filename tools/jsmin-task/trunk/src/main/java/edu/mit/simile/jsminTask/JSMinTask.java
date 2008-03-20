package edu.mit.simile.jsminTask;

import java.io.BufferedInputStream;
import java.io.BufferedReader;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.FileReader;
import java.io.IOException;
import java.io.OutputStream;
import java.io.OutputStreamWriter;
import java.io.Reader;
import java.io.Writer;
import java.nio.charset.Charset;
import java.util.LinkedList;
import java.util.List;

import org.apache.tools.ant.BuildException;
import org.apache.tools.ant.DirectoryScanner;
import org.apache.tools.ant.Task;
import org.apache.tools.ant.types.FileSet;
import org.mozilla.javascript.ErrorReporter;
import org.mozilla.javascript.EvaluatorException;

import com.ibm.icu.text.CharsetDetector;
import com.ibm.icu.text.CharsetMatch;
import com.yahoo.platform.yui.compressor.JavaScriptCompressor;

public class JSMinTask extends Task {
	private List<FileSet> m_fileSets = new LinkedList<FileSet>();
	private File		  m_outputFile;
	private File          m_prefixFile;
    private File          m_suffixFile;
    
	private boolean       m_verbose;
    private boolean       m_obfuscate = true;
    private boolean       m_printWarnings = false;
    private boolean       m_preserveSemicolons = true;
    private boolean       m_preserveStringLiterals = false;
    
    public void setVerbose(boolean verbose) {
        m_verbose = verbose;
    }
    
    public void setObfuscate(boolean obfuscate) {
        m_obfuscate = obfuscate;
    }
    
    public void setPrintWarnings(boolean printWarnings) {
        m_printWarnings = printWarnings;
    }
    
    public void setPreserveSemicolons(boolean preserveSemicolons) {
        m_preserveSemicolons = preserveSemicolons;
    }
    
    public void setPreserveStringLiterals(boolean preserveStringLiterals) {
        m_preserveStringLiterals = preserveStringLiterals;
    }
    
	public void setOutput(File file) {
		m_outputFile = file;
	}
	
	public void setPrefix(File file) {
		m_prefixFile = file;
	}
	
    public void setSuffix(File file) {
        m_suffixFile = file;
    }
    
	public void addFileSet(FileSet fileSet) {
		m_fileSets.add(fileSet);
	}
	
	@Override
	public void execute() throws BuildException {
		if (m_outputFile == null) {
			throw new BuildException("No output file specified.");
		}
		
        try {
            OutputStream os = new FileOutputStream(m_outputFile);
            os.write(new byte[] { (byte)0xEF, (byte)0xBB, (byte)0xBF });
            
    		Writer writer = new OutputStreamWriter(os, Charset.forName("UTF-8"));
    		try {
                if (m_prefixFile != null) {
                    appendFile(m_prefixFile, writer);
                }
                
    			for (FileSet fileSet : m_fileSets) {
    		        File projectDir = fileSet.getDir(getProject());
    	            DirectoryScanner ds = fileSet.getDirectoryScanner(getProject());
    	            
    	            String[] srcFiles = ds.getIncludedFiles();
    	            String[] srcDirs = ds.getIncludedDirectories();
    	            
    	            for (int i = 0; i < srcFiles.length; i++) {
    	            	processFile(new File(projectDir, srcFiles[i]), writer);
    	            }
    	            
    	            for (int i = 0; i < srcDirs.length; i++) {
    	            	processDirectory(new File(projectDir, srcDirs[i]), writer);
    	            }
    			}
                
                if (m_suffixFile != null) {
                    appendFile(m_suffixFile, writer);
                }
    		} finally {
    			writer.close();
                os.close();
    		}
        } catch (IOException e) {
            throw new BuildException(e);
        }
	}
	
	protected void processDirectory(File dir, Writer writer) throws BuildException {
		File[] files = dir.listFiles();
		for (int i = 0; i < files.length; i++) {
			File file = files[i];
			if (file.isDirectory()) {
				processDirectory(file, writer);
			} else if (file.getName().endsWith(".js")) {
				processFile(file, writer);
			}
		}
	}
	
	protected void processFile(File file, Writer writer) throws BuildException {
		try {
    		Reader reader = detectCharset(file);
    		try {
                //JSMin jsmin = new JSMin(reader, writer);
                
                writer.write("\n\n/* " + file.getName() + " */\n");
                
    			//jsmin.jsmin();
                
                JavaScriptCompressor compressor = new JavaScriptCompressor(reader, new ErrorReporter() {
                    public void warning(String message, String sourceName,
                            int line, String lineSource, int lineOffset) {
                        if (line < 0) {
                            System.err.println("\n[WARNING] " + message);
                        } else {
                            System.err.println("\n" + line + ':' + lineOffset + ':' + message);
                        }
                    }

                    public void error(String message, String sourceName,
                            int line, String lineSource, int lineOffset) {
                        if (line < 0) {
                            System.err.println("\n[ERROR] " + message);
                        } else {
                            System.err.println("\n" + line + ':' + lineOffset + ':' + message);
                        }
                    }

                    public EvaluatorException runtimeError(String message, String sourceName,
                            int line, String lineSource, int lineOffset) {
                        error(message, sourceName, line, lineSource, lineOffset);
                        return new EvaluatorException(message);
                    }
                });

                compressor.compress(
                    writer, 
                    0, // line breaks after semicolons 
                    m_obfuscate, 
                    m_printWarnings,
                    m_preserveSemicolons, 
                    m_preserveStringLiterals
                );
            } finally {
    			reader.close();
    		}
        } catch (Exception e) {
            System.err.println(e.getMessage());
            
            throw new BuildException("Error processing " + file.getAbsolutePath(), e);
        }
	}
    
    protected Reader detectCharset(File file) throws IOException {
        BufferedInputStream inputStream = new BufferedInputStream(new FileInputStream(file));
        try {
        	CharsetDetector detector = new CharsetDetector();
            detector.setText(inputStream);
            
            CharsetMatch match = detector.detect();
            if (m_verbose) {
                System.out.println("Guess encoding of " + file.getAbsolutePath() + ": " + match.getName());
            }
            
            Reader reader = match.getReader();
            if ("UTF-8".equals(match.getName())) {
                int first = reader.read();
                if (first != 0xFEFF) { // if not byte order mark
                    reader.reset();
                }
            }
            return reader;
        } catch (Exception e) {
            inputStream.close();
            
        	return new BufferedReader(new FileReader(file));
        }
    }
    
    protected void appendFile(File file, Writer writer) throws BuildException {
        try {
            FileReader reader = new FileReader(file);
            try {
                char[] chars = new char[1024];
                int c;
                
                while ((c = reader.read(chars)) > 0) {
                    writer.write(chars, 0, c);
                }
            } finally {
                reader.close();
            }
        } catch (Exception e) {
            throw new BuildException("Error processing " + file.getAbsolutePath(), e);
        }
    }
}
