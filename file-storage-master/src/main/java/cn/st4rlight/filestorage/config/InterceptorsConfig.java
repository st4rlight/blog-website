package cn.st4rlight.filestorage.config;

import cn.st4rlight.filestorage.interceptors.RequestIdInterceptor;
import cn.st4rlight.filestorage.interceptors.TimeCostInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import javax.annotation.Resource;

@Configuration
public class InterceptorsConfig extends WebMvcConfigurationSupport {

    @Resource
    private RequestIdInterceptor requestIdInterceptor;

    @Resource
    private TimeCostInterceptor timeCostInterceptor;

    @Override
    protected void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(timeCostInterceptor).addPathPatterns("/**");
        registry.addInterceptor(requestIdInterceptor).addPathPatterns("/**");

        super.addInterceptors(registry);
    }

    @Override
    protected void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/");
        registry.addResourceHandler("swagger-ui.html")
                .addResourceLocations("classpath:/META-INF/resources/");
        registry.addResourceHandler("/webjars/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/");
        super.addResourceHandlers(registry);
    }
}
