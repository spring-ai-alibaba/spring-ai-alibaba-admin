package com.alibaba.cloud.ai.studio.admin.utils;

import com.alibaba.cloud.ai.studio.admin.dto.ModelConfigInfo;
import com.alibaba.cloud.ai.studio.admin.repository.ModelConfigRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class ModelConfigParser {
    
    private final ObjectMapper objectMapper;
    
    private final ModelConfigRepository modelConfigRepository;
    
    /**
     * 解析模型配置JSON字符串
     *
     * @param modelConfigJson 模型配置JSON
     * @return 模型配置信息
     */
    public ModelConfigInfo parseModelConfig(String modelConfigJson) {
        if (!StringUtils.hasText(modelConfigJson)) {
            throw new IllegalArgumentException("模型配置不能为空");
        }
        
        try {
            return objectMapper.readValue(modelConfigJson, ModelConfigInfo.class);
        } catch (Exception e) {
            log.error("解析模型配置JSON失败: {}", modelConfigJson, e);
            throw new IllegalArgumentException("模型配置格式错误: " + e.getMessage(), e);
        }
    }
    
    public ModelConfigInfo checkAndGetModelConfigInfo(String modelConfig) {
        ModelConfigInfo modelConfigInfo = null;
        try {
            modelConfigInfo = parseModelConfig(modelConfig);
            validateModelConfig(modelConfigInfo);
            // 3. 验证模型配置是否存在
            if (!modelConfigRepository.existsById(modelConfigInfo.getModelId())) {
                throw new IllegalArgumentException("模型配置不存在: " + modelConfigInfo.getModelId());
            }
        } catch (Exception e) {
            log.error("解析模型配置失败: modelConfig={}", modelConfig, e);
            throw new RuntimeException("模型配置解析失败: " + e.getMessage(), e);
        }
        return modelConfigInfo;
    }
    
    /**
     * 提取模型调用参数 从ModelConfigInfo中获取动态参数并转换格式
     *
     * @param modelConfigInfo 模型配置信息对象
     * @return 模型调用参数Map
     */
    public Map<String, Object> extractModelParameters(ModelConfigInfo modelConfigInfo) {
        if (modelConfigInfo == null) {
            return new HashMap<>();
        }
        
        Map<String, Object> convertedParameters = new HashMap<>();
        Map<String, Object> originalParameters = modelConfigInfo.getAllParameters();
        
        // 转换参数名称和格式
        for (Map.Entry<String, Object> entry : originalParameters.entrySet()) {
            String originalKey = entry.getKey();
            Object value = entry.getValue();
            
            if (value != null) {
                String convertedKey = convertParameterName(originalKey);
                convertedParameters.put(convertedKey, value);
            }
        }
        
        return convertedParameters;
    }
    
    /**
     * 转换参数名称格式 将驼峰命名转换为下划线命名，以适配OpenAI API格式
     *
     * @param parameterName 原参数名
     * @return 转换后的参数名
     */
    private String convertParameterName(String parameterName) {
        // 自动将驼峰命名转换为下划线命名
        return parameterName.replaceAll("([a-z])([A-Z])", "$1_$2").toLowerCase();
    }
    
    /**
     * 替换Prompt模板中的变量
     *
     * @param template      Prompt模板
     * @param variablesJson 变量JSON字符串
     * @return 替换后的Prompt
     */
    public String replaceVariables(String template, String variablesJson) {
        if (!StringUtils.hasText(template)) {
            return "";
        }
        
        if (!StringUtils.hasText(variablesJson)) {
            return template;
        }
        
        try {
            JsonNode variables = objectMapper.readTree(variablesJson);
            StringBuilder resultBuilder = new StringBuilder(template);
            
            // 替换所有变量占位符
            variables.fields().forEachRemaining(entry -> {
                String placeholder = "{{" + entry.getKey() + "}}";
                String value = entry.getValue().asText();
                String current = resultBuilder.toString();
                resultBuilder.setLength(0);
                resultBuilder.append(current.replace(placeholder, value));
            });
            
            return resultBuilder.toString();
        } catch (Exception e) {
            log.warn("变量替换失败，使用原始模板: template={}, variables={}", template, variablesJson, e);
            return template;
        }
    }
    
    /**
     * 验证模型配置的有效性 只验证必需字段，动态参数由模型服务自行验证
     *
     * @param modelConfigInfo 模型配置信息
     * @throws IllegalArgumentException 如果配置无效
     */
    public void validateModelConfig(ModelConfigInfo modelConfigInfo) {
        if (modelConfigInfo == null) {
            throw new IllegalArgumentException("模型配置不能为空");
        }
        
        if (modelConfigInfo.getModelId() == null) {
            throw new IllegalArgumentException("模型ID不能为空");
        }
        
        // 只进行基本的数据类型验证，具体的参数范围由模型服务验证
        validateParameterTypes(modelConfigInfo);
    }
    
    /**
     * 验证参数类型是否合理 确保数值参数确实是数值类型
     *
     * @param modelConfigInfo 模型配置信息
     */
    private void validateParameterTypes(ModelConfigInfo modelConfigInfo) {
        Map<String, Object> parameters = modelConfigInfo.getAllParameters();
        
        for (Map.Entry<String, Object> entry : parameters.entrySet()) {
            String name = entry.getKey();
            Object value = entry.getValue();
            
            if (value == null) {
                continue;
            }
            
            // 对于明显的数值参数名，验证类型
            if (isNumericParameterName(name)) {
                validateNumericValue(name, value);
            }
        }
    }
    
    /**
     * 判断参数名是否是数值类型参数
     *
     * @param parameterName 参数名
     * @return 是否是数值参数
     */
    private boolean isNumericParameterName(String parameterName) {
        String lowerName = parameterName.toLowerCase();
        return lowerName.contains("temperature") || lowerName.contains("token") || lowerName.contains("top_")
                || lowerName.contains("penalty") || lowerName.contains("max_") || lowerName.contains("min_")
                || lowerName.endsWith("_p") || lowerName.endsWith("_k");
    }
    
    /**
     * 验证数值类型的参数值
     *
     * @param parameterName 参数名
     * @param value         参数值
     */
    private void validateNumericValue(String parameterName, Object value) {
        if (value instanceof Number) {
            return; // 已经是数值类型
        }
        
        if (value instanceof String) {
            try {
                Double.parseDouble((String) value);
                return; // 可以转换为数值
            } catch (NumberFormatException e) {
                throw new IllegalArgumentException(
                        String.format("参数 %s 的值 '%s' 不是有效的数值", parameterName, value));
            }
        }
        
        throw new IllegalArgumentException(String.format("参数 %s 的值 '%s' 应该是数值类型", parameterName, value));
    }
}
