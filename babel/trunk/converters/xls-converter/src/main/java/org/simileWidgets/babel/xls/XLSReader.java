package org.simileWidgets.babel.xls;

import java.io.InputStream;
import java.io.Reader;
import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Properties;

import org.apache.commons.codec.net.URLCodec;
import org.apache.commons.lang.NotImplementedException;
import org.apache.commons.lang.StringUtils;
import org.apache.poi.hssf.usermodel.HSSFCell;
import org.apache.poi.hssf.usermodel.HSSFDateUtil;
import org.apache.poi.hssf.usermodel.HSSFRow;
import org.apache.poi.hssf.usermodel.HSSFSheet;
import org.apache.poi.hssf.usermodel.HSSFWorkbook;
import org.apache.poi.poifs.filesystem.POIFSFileSystem;
import org.openrdf.model.Resource;
import org.openrdf.model.URI;
import org.openrdf.model.Value;
import org.openrdf.model.impl.LiteralImpl;
import org.openrdf.model.impl.URIImpl;
import org.openrdf.model.vocabulary.RDF;
import org.openrdf.model.vocabulary.RDFS;
import org.openrdf.model.vocabulary.XMLSchema;
import org.openrdf.sail.Sail;
import org.openrdf.sail.SailConnection;
import org.openrdf.sail.SailException;
import org.simileWidgets.babel.BabelReader;
import org.simileWidgets.babel.GenericType;
import org.simileWidgets.babel.SemanticType;
import org.simileWidgets.babel.SerializationFormat;
import org.simileWidgets.babel.exhibit.ExhibitOntology;


public class XLSReader implements BabelReader {

    static class Column {
        String      m_name;
        URI         m_uri;
        boolean     m_singleValue = false;
        ValueType   m_valueType = ValueType.Text;
    }
    static class Item {
        String      m_label;
        String      m_id;
        URI         m_type;
        URI         m_uri;
        Map<Column, List<HSSFCell>> m_properties = new HashMap<Column, List<HSSFCell>>();
    }
    static enum ValueType {
        Item,
        Text,
        Number,
        Boolean,
        URL
    }
    
    public String getDescription(Locale locale) {
        return "XLS reader";
    }

    public String getLabel(Locale locale) {
        return "XLS Reader";
    }

    public SemanticType getSemanticType() {
        return GenericType.s_singleton;
    }

    public SerializationFormat getSerializationFormat() {
        return XLSFormat.s_singleton;
    }

    public boolean takesReader() {
        return false;
    }
    
    public void read(Reader reader, Sail sail, Properties properties, Locale locale) throws Exception {
        throw new NotImplementedException();
    }

    public void read(InputStream inputStream, Sail sail, Properties properties, Locale locale) throws Exception {
        POIFSFileSystem fs = new POIFSFileSystem(inputStream);
        HSSFWorkbook wb = new HSSFWorkbook(fs);
        HSSFSheet sheet = wb.getSheetAt(0);
        
        int firstRow = sheet.getFirstRowNum();
        int lastRow = sheet.getLastRowNum();
        
        String              namespace = properties.getProperty("namespace");
        List<Column>        columns = new ArrayList<Column>();
        short               uriColumn = -1;
        short               idColumn = -1;
        short               labelColumn = -1;
        short               typeColumn = -1;
        int                 r = firstRow;
        
        /*
         * Find the header row
         */
        for (; r <= lastRow; r++) {
            HSSFRow row = sheet.getRow(r);
            if (row == null) {
                continue;
            }
            
            short firstCell = row.getFirstCellNum();
            short lastCell = row.getLastCellNum();
            if (firstCell >= 0 && firstCell <= lastCell) {
                for (short c = 0; c <= lastCell; c++) {
                    HSSFCell cell = row.getCell(c);
                    Column column = null;
                    if (cell != null) {
                        String spec = cell.getStringCellValue().trim();
                        if (spec.length() > 0) {
                            column = new Column();
                            
                            int colon = spec.indexOf(':');
                            if (colon < 0) {
                                column.m_name = spec;
                            } else {
                                column.m_name = spec.substring(0, colon).trim();
                                
                                String[] details = StringUtils.splitPreserveAllTokens(spec.substring(colon + 1), ',');
                                for (int d = 0; d < details.length; d++) {
                                    String detail = details[d].trim().toLowerCase();
                                    if ("single".equals(detail)) {
                                        column.m_singleValue = true;
                                    } else if ("item".equals(detail)) {
                                        column.m_valueType = ValueType.Item;
                                    } else if ("number".equals(detail)) {
                                        column.m_valueType = ValueType.Number;
                                    } else if ("boolean".equals(detail)) {
                                        column.m_valueType = ValueType.Boolean;
                                    } else if ("url".equals(detail)) {
                                        column.m_valueType = ValueType.URL;
                                    }
                                }
                            }
                            
                            /*
                             * The user might capitalize the column name in all sorts
                             * of way. Make sure we are insensitive to the capitalization.
                             */
                            if (column.m_name.equalsIgnoreCase("uri")) {
                                column.m_name = "uri";
                                uriColumn = c;
                            } else if (column.m_name.equalsIgnoreCase("type")) {
                                column.m_name = "type";
                                typeColumn = c;
                            } else if (column.m_name.equalsIgnoreCase("label")) {
                                column.m_name = "label";
                                labelColumn = c;
                            } else if (column.m_name.equalsIgnoreCase("id")) {
                                column.m_name = "id";
                                idColumn = c;
                            } else {
                                column.m_uri = new URIImpl(namespace + encode(column.m_name));
                            }
                        }
                    }
                    columns.add(column);
                }
                r++;
                break;
            }
        }
        
        /*
         * Try to use the first non-null column as the label column 
         * if we still haven't found the label column.
         */
        if (labelColumn < 0) {
            for (short c = 0; c < columns.size(); c++) {
                if (columns.get(c) != null) {
                    labelColumn = c;
                    break;
                }
            }
        }
        
        if (labelColumn >= 0) {
            Map<String, Item> idToItem = new HashMap<String, Item>();
            
            /*
             * The first pass will collect all the items and
             * their properties as well as assign URIs to them.
             */
            for (; r <= lastRow; r++) {
                HSSFRow row = sheet.getRow(r);
                if (row == null) {
                    continue;
                }
                
                short firstCell = row.getFirstCellNum();
                short lastCell = row.getLastCellNum();
                if (firstCell >= 0 && firstCell <= lastCell) {
                    HSSFCell cell = row.getCell(labelColumn);
                    if (cell == null) {
                        continue;
                    }
                    
                    String label = getCellString(cell);
                    if (label == null || label.length() == 0) {
                        continue;
                    }
                    
                    String id = idColumn < 0 ? label : 
                        getCellString(row.getCell(idColumn));
                    if (id.length() == 0) {
                        id = label;
                    }
                    
                    String uri = uriColumn < 0 ? null : 
                        getCellString(row.getCell(uriColumn));
                    if (uri == null || uri.length() == 0) {
                        uri = namespace + encode(id);
                    }

                    String type = typeColumn < 0 ? "Item" : 
                        getCellString(row.getCell(typeColumn));
                    if (type == null || type.length() == 0) {
                        type = "Item";
                    }
                    
                    Item item = idToItem.get(id);
                    if (item == null) {
                        item = new Item();
                        item.m_id = id;
                        item.m_uri = new URIImpl(uri);
                        item.m_label = label;
                        item.m_type = new URIImpl(namespace + encode(type));
                        
                        idToItem.put(id, item);
                    }
                    
                    for (short c = 0; c <= lastCell; c++) {
                        Column column = columns.get(c);
                        
                        if (column != null && column.m_uri != null) {
                            cell = row.getCell(c);
                            if (cell != null) {
                                List<HSSFCell> cells = item.m_properties.get(column);
                                if (cells == null) {
                                    cells = new LinkedList<HSSFCell>();
                                    item.m_properties.put(column, cells);
                                }
                                cells.add(cell);
                            }
                        }
                    }
                }
            }
                
            SailConnection c = sail.getConnection();
            try {
                for (Item item : idToItem.values()) {
                    c.addStatement(item.m_uri, RDF.TYPE, item.m_type);
                    c.addStatement(item.m_uri, RDFS.LABEL, new LiteralImpl(item.m_label));
                    c.addStatement(item.m_uri, ExhibitOntology.ID, new LiteralImpl(item.m_id));
                    
                    for (Column column : item.m_properties.keySet()) {
                        if (column.m_uri != null) {
                            List<HSSFCell> cells = item.m_properties.get(column);
                            if (cells != null) {
                                for (HSSFCell cell : cells) {
                                    int cellType = cell.getCellType();
                                    if (cellType == HSSFCell.CELL_TYPE_BLANK || cellType == HSSFCell.CELL_TYPE_ERROR) {
                                        continue;
                                    }
                                    
                                    if (cellType == HSSFCell.CELL_TYPE_BOOLEAN) {
                                        try {
                                            boolean b = cell.getBooleanCellValue();
                                            addStatement(c, item.m_uri, column.m_uri, new Boolean(b), column.m_valueType, idToItem, namespace);
                                            continue;
                                        } catch (Exception e) {
                                        }
                                    }
                                    
                                    if (cellType == HSSFCell.CELL_TYPE_NUMERIC) {
                                        if (HSSFDateUtil.isCellDateFormatted(cell)) {
                                            try {
                                                Date d = cell.getDateCellValue();
                                                addStatement(c, item.m_uri, column.m_uri, d, column.m_valueType, idToItem, namespace);
                                                continue;
                                            } catch (Exception e) {
                                            }
                                        }
                                        
                                        try {
                                            double d = cell.getNumericCellValue();
                                            boolean isDouble = (Double.compare(d, Math.floor(d)) != 0);
                                            Object object = isDouble ? ((Object) new Double(d)) : ((Object) new Long((long) d));
                                            
                                            addStatement(c, item.m_uri, column.m_uri, object, column.m_valueType, idToItem, namespace);
                                            continue;
                                        } catch (Exception e) {
                                        }
                                    }
                                    
                                    String s = cell.getStringCellValue().trim();
                                    if (s.length() > 0) {
                                        if (column.m_singleValue) {
                                            addStatement(c, item.m_uri, column.m_uri, s, column.m_valueType, idToItem, namespace);
                                        } else {
                                            String[] values = StringUtils.splitPreserveAllTokens(s, ';');
                                            for (String value : values) {
                                                addStatement(c, item.m_uri, column.m_uri, value.trim(), column.m_valueType, idToItem, namespace);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
                
                c.commit();
            } catch (SailException e) {
                c.rollback();
                throw e;
            } finally {
                c.close();
            }
        }
    }
    
    protected String getCellString(HSSFCell cell) {
        if (cell == null) {
            return null;
        }
        
        int cellType = cell.getCellType();
        if (cellType == HSSFCell.CELL_TYPE_BLANK || cellType == HSSFCell.CELL_TYPE_ERROR) {
            return null;
        }
        
        try {
            return cell.getStringCellValue().trim();
        } catch (Exception e) {
        }
        
        try {
            double d = cell.getNumericCellValue();
            if (Double.compare(d, Math.floor(d)) != 0) {
                return Double.toString(d);
            } else {
                return Long.toString(Math.round(d));
            }
        } catch (Exception e) {
        }
        
        return null;
    }
    
    protected void addStatement(
        SailConnection      connection, 
        Resource            subject, 
        URI                 predicate,
        Object              object, 
        ValueType           valueType, 
        Map<String, Item>   idToItem,
        String              namespace
    ) throws SailException {
        Value v = null;
        if (valueType == ValueType.Item) {
            Item item = idToItem.get(object);
            if (item != null) {
                v = item.m_uri;
            } else {
                v = new URIImpl(namespace + encode(object.toString()));
            }
        } else {
            if (object instanceof Long) {
                v = new LiteralImpl(object.toString(), XMLSchema.LONG);
            } else if (object instanceof Double) {
                v = new LiteralImpl(object.toString(), XMLSchema.DOUBLE);
            } else if (object instanceof Boolean) {
                v = new LiteralImpl(((Boolean) object).booleanValue() ? "true" : "false", XMLSchema.BOOLEAN);
            } else if (object instanceof Date) {
                SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ssZ");
                String s = sdf.format(object);
                int l = s.length() - 2;

                v = new LiteralImpl(s.substring(0, l) + ":" + s.substring(l), XMLSchema.DATETIME);
            } else {
                v = new LiteralImpl(object.toString());
            }
        }
        connection.addStatement(subject, predicate, v);
    }
    
    private static final String s_urlEncoding = "UTF-8";
    private static final URLCodec s_codec = new URLCodec();
    
    static String encode(String s) {
        try {
            return s_codec.encode(s, s_urlEncoding);
        } catch (Exception e) {
            throw new RuntimeException("Exception encoding " + s + " with " + s_urlEncoding + " encoding.");
        }
    }
}
